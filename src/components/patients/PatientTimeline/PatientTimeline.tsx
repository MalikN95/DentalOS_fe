'use client';

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import type { TimelinePoint } from '@/common/types/timeline';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  FileTextIcon,
  MinusIcon,
  PlusIcon,
  WalletIcon,
} from '@/components/icons/icons';
import { addDays, daysBetween, formatDate, formatMonthLabel, startOfDay } from '@/helpers/date';
import {
  getTimelineEventKindLabel,
  getTimelineEventSubtitle,
  getTimelineEventTitle,
} from '@/helpers/patient-timeline';
import { useDragScroll } from '@/hooks/useDragScroll';
import styles from './PatientTimeline.module.css';

const PADDING_DAYS = 21;
// 7 steps, week-detail to year-overview: px-per-day large enough that a week
// of daily bubbles stays readable at the top end, small enough that a full
// year stays a reasonable track width at the bottom end.
const ZOOM_LEVELS = [2.5, 4, 7, 11, 18, 30, 50];
const DEFAULT_ZOOM_INDEX = 3;
const MIN_TRACK_WIDTH = 640;
const MAX_LANE = 1;
// Gap (px) in the center line at each month boundary.
const MONTH_LINE_GAP = 10;

// The whole vertical scale (bubble offset/radius, lane spacing, track height,
// tooltip gap) moves together as one unit depending on `compact` — the inline
// row embedded in an appointment card vs. the full patient-profile size.
const buildSizeConfig = (
  bubbleOffset: number,
  bubbleRadius: number,
  laneStep: number,
  headroom: number,
  iconSize: number,
) => {
  // Just enough headroom for the farthest lane's bubble on each side.
  const lineY = bubbleOffset + MAX_LANE * laneStep + headroom;

  return {
    bubbleOffset,
    bubbleRadius,
    laneStep,
    lineY,
    trackHeight: lineY * 2,
    // Gap between a bubble's edge and its click-to-open detail card.
    tooltipGap: bubbleRadius + 10,
    // Two events closer than this (px) would visually touch, so they're
    // pushed into separate stacking lanes instead of drawn on top of each other.
    minEventGap: bubbleRadius * 2 + 10,
    iconSize,
  };
};

const SIZE_CONFIG = {
  default: buildSizeConfig(58, 17, 40, 20, 16),
  compact: buildSizeConfig(26, 10, 20, 10, 10),
};
// Accumulated deltaY (px) before a wheel gesture steps the zoom once —
// keeps a single mouse-wheel notch from jumping more than one level while
// still feeling responsive.
const WHEEL_ZOOM_THRESHOLD = 50;
// How long the px-per-day value takes to ease into a new zoom level.
const ZOOM_ANIMATION_MS = 250;
const easeOutCubic = (t: number): number => 1 - (1 - t) ** 3;

type EventSide = 'above' | 'below';

// Places closely-spaced events into stacking lanes (above/below the line) so
// clustered dates — e.g. a visit's appointment + record + invoice on the same
// day — don't render as one unreadable pile of overlapping bubbles.
const layoutEvents = <T,>(
  items: T[],
  getX: (item: T) => number,
  minEventGap: number,
): { item: T; x: number; side: EventSide; lane: number }[] => {
  const laneLastX: Record<EventSide, number[]> = { above: [], below: [] };

  const findLane = (side: EventSide, x: number) => {
    const lastX = laneLastX[side];
    for (let lane = 0; lane <= MAX_LANE; lane += 1) {
      if (lastX[lane] === undefined || x - lastX[lane] >= minEventGap) return lane;
    }
    return MAX_LANE;
  };

  let toggle = 0;

  return items
    .map((item) => ({ item, x: getX(item) }))
    .sort((a, b) => a.x - b.x)
    .map(({ item, x }) => {
      const aboveLane = findLane('above', x);
      const belowLane = findLane('below', x);

      let side: EventSide;
      if (aboveLane !== belowLane) {
        side = aboveLane < belowLane ? 'above' : 'below';
      } else {
        side = toggle % 2 === 0 ? 'above' : 'below';
        toggle += 1;
      }

      const lane = side === 'above' ? aboveLane : belowLane;
      laneLastX[side][lane] = x;

      return { item, x, side, lane };
    });
};

const EVENT_ICON: Record<TimelinePoint['type'], typeof CalendarIcon> = {
  appointment: CalendarIcon,
  record: FileTextIcon,
  invoice: WalletIcon,
};

const buildYearTicks = (rangeStart: Date, rangeEnd: Date): { year: number; date: Date }[] => {
  const ticks: { year: number; date: Date }[] = [];
  for (let year = rangeStart.getFullYear(); year <= rangeEnd.getFullYear(); year += 1) {
    const jan1 = new Date(year, 0, 1);
    ticks.push({ year, date: jan1 < rangeStart ? rangeStart : jan1 });
  }
  return ticks;
};

// Subtle dashed guide at each month boundary strictly inside the range —
// the edges are already marked by the range padding, not a real boundary.
const buildMonthTicks = (rangeStart: Date, rangeEnd: Date): Date[] => {
  const ticks: Date[] = [];
  const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth() + 1, 1);
  while (cursor <= rangeEnd) {
    ticks.push(new Date(cursor));
    cursor.setMonth(cursor.getMonth() + 1);
  }
  return ticks;
};

type PatientTimelineProps = {
  events: TimelinePoint[];
  currency?: string;
  isLoading?: boolean;
  /** Shrinks the whole axis for embedding in a narrow row (e.g. an appointment card) and hides the heading. */
  compact?: boolean;
  className?: string;
  style?: React.CSSProperties;
};

export const PatientTimeline = ({
  events,
  currency = 'RUB',
  isLoading = false,
  compact = false,
  className,
  style,
}: PatientTimelineProps) => {
  const { t } = useTranslation();
  const size = compact ? SIZE_CONFIG.compact : SIZE_CONFIG.default;
  // Compact (board) instances open at max zoom — the most detail in the
  // least width, since the card itself is already narrow.
  const initialZoomIndex = compact ? ZOOM_LEVELS.length - 1 : DEFAULT_ZOOM_INDEX;
  const [zoomIndex, setZoomIndex] = useState(initialZoomIndex);
  // The actual px-per-day used for layout, eased towards ZOOM_LEVELS[zoomIndex]
  // by the animation effect below — this is what makes zoom changes glide
  // instead of snap. pxPerDayRef mirrors it (kept in sync inside that same
  // effect, not during render) so a new animation can read the live value —
  // wherever the previous one currently is — as its start point.
  const [pxPerDay, setPxPerDay] = useState(() => ZOOM_LEVELS[initialZoomIndex]);
  const pxPerDayRef = useRef(pxPerDay);
  // The date (as a day-offset from rangeStart) and screen position that must
  // stay put while pxPerDay animates — under the cursor for wheel-zoom, at
  // the viewport's own center for the +/- buttons. Cleared once the eased
  // pxPerDay reaches its target, so an unrelated resize doesn't reapply it.
  const zoomAnchorRef = useRef<{ dayOffset: number; viewportOffset: number } | null>(null);
  const hasCenteredOnceRef = useRef(false);
  const { ref: scrollRef, isDragging, handlers } = useDragScroll<HTMLDivElement>();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const bodyRef = useRef<HTMLDivElement | null>(null);
  const wheelDeltaRef = useRef(0);
  // Captured once so the "today" marker and range padding don't shift on re-render.
  const [today] = useState(() => new Date());
  // So the track (and its line) fills a wide viewport instead of stopping
  // short and leaving dead space when there isn't much to draw.
  const [containerWidth, setContainerWidth] = useState(0);
  const [activeEvent, setActiveEvent] = useState<{
    event: TimelinePoint;
    top: number;
    left: number;
    side: EventSide;
  } | null>(null);

  useEffect(() => {
    const el = scrollRef.current;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) setContainerWidth(entry.contentRect.width);
    });

    if (el) observer.observe(el);

    return () => observer.disconnect();
    // scrollRef is a stable ref object from useDragScroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Symmetric around "today" (not just around the events) so today always
  // lands exactly at the range's midpoint, however lopsided the events are.
  const { rangeStart, rangeEnd } = useMemo(() => {
    const todayStart = startOfDay(today);
    const dates = events.map((event) => startOfDay(new Date(event.date)));
    const daysBefore = Math.max(0, ...dates.map((date) => daysBetween(date, todayStart)));
    const daysAfter = Math.max(0, ...dates.map((date) => daysBetween(todayStart, date)));
    const halfSpan = Math.max(daysBefore, daysAfter) + PADDING_DAYS;

    return {
      rangeStart: addDays(todayStart, -halfSpan),
      rangeEnd: addDays(todayStart, halfSpan),
    };
  }, [events, today]);

  const targetPxPerDay = ZOOM_LEVELS[zoomIndex];
  const totalDays = Math.max(daysBetween(rangeStart, rangeEnd), 1);
  const contentWidth = totalDays * pxPerDay;
  const trackWidth = Math.max(contentWidth, MIN_TRACK_WIDTH, containerWidth);
  // Splits any extra width (beyond what the date range needs) evenly on
  // both sides, so "today" — the exact midpoint of the range — also lands
  // at the midpoint of the track, centered by default with no scrolling.
  const offsetX = (trackWidth - contentWidth) / 2;
  const dateToX = (date: Date) => offsetX + daysBetween(rangeStart, date) * pxPerDay;
  const todayX = dateToX(today);

  const yearTicks = useMemo(() => buildYearTicks(rangeStart, rangeEnd), [rangeStart, rangeEnd]);
  const monthTicks = useMemo(() => buildMonthTicks(rangeStart, rangeEnd), [rangeStart, rangeEnd]);

  // One line segment per calendar month, with a small gap at each month
  // boundary — so the center line breaks exactly on months, not on a fixed
  // pixel pattern that would drift out of sync with them.
  const monthSegments = useMemo(() => {
    const boundaries = [rangeStart, ...monthTicks, rangeEnd];
    const toX = (date: Date) => offsetX + daysBetween(rangeStart, date) * pxPerDay;

    return boundaries.slice(0, -1).map((start, index) => {
      const end = boundaries[index + 1];
      const isFirst = index === 0;
      const isLast = index === boundaries.length - 2;
      const left = toX(start) + (isFirst ? 0 : MONTH_LINE_GAP / 2);
      const right = toX(end) - (isLast ? 0 : MONTH_LINE_GAP / 2);

      return {
        key: start.getTime(),
        left,
        width: Math.max(right - left, 0),
        // The first/last segments are partial fragments from the range's
        // padding, not a real calendar month, so they stay unlabeled.
        isFullMonth: !isFirst && !isLast,
        monthStart: start,
      };
    });
  }, [rangeStart, rangeEnd, monthTicks, offsetX, pxPerDay]);

  // Centered inside its own segment (not pinned to the segment's left edge),
  // so the name reads as "this label belongs to this month's stretch of line".
  const monthLabels = useMemo(
    () =>
      monthSegments
        .filter((segment) => segment.isFullMonth)
        .map((segment) => ({
          key: segment.key,
          x: segment.left + segment.width / 2,
          text: formatMonthLabel(segment.monthStart),
        })),
    [monthSegments],
  );

  const positionedEvents = useMemo(
    () =>
      layoutEvents(
        events,
        (event) => daysBetween(rangeStart, new Date(event.date)) * pxPerDay,
        size.minEventGap,
      ).map(({ item, x, side, lane }) => ({ event: item, x: x + offsetX, side, lane })),
    [events, rangeStart, pxPerDay, offsetX, size],
  );

  // Eases pxPerDay from wherever it currently is towards the target zoom
  // level. Restarting mid-flight (rapid clicks/wheel steps) resumes from the
  // live value via pxPerDayRef instead of the old target, so it never jumps.
  useEffect(() => {
    if (pxPerDayRef.current === targetPxPerDay) return undefined;

    const startValue = pxPerDayRef.current;
    const startTime = performance.now();
    let frameId: number;

    const tick = (now: number) => {
      const progress = Math.min((now - startTime) / ZOOM_ANIMATION_MS, 1);
      const value = startValue + (targetPxPerDay - startValue) * easeOutCubic(progress);
      pxPerDayRef.current = value;
      setPxPerDay(value);

      if (progress < 1) {
        frameId = requestAnimationFrame(tick);
      } else {
        zoomAnchorRef.current = null;
      }
    };

    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [targetPxPerDay]);

  // Keeps whichever point was captured as the zoom anchor (cursor position
  // for wheel-zoom, viewport center for the +/- buttons) stationary on screen
  // on every step of the pxPerDay animation above — this is what makes zoom
  // feel like it scales around that point instead of jumping to re-center.
  // Falls back to centering on "today", but only once, on mount.
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const anchor = zoomAnchorRef.current;
    if (anchor) {
      const anchorX = offsetX + anchor.dayOffset * pxPerDay;
      el.scrollLeft = Math.max(anchorX - anchor.viewportOffset, 0);
      return;
    }

    if (!hasCenteredOnceRef.current) {
      hasCenteredOnceRef.current = true;
      el.scrollLeft = Math.max(todayX - el.clientWidth / 2, 0);
    }
    // scrollRef is a stable ref object; todayX derives from offsetX/pxPerDay/rangeStart.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offsetX, pxPerDay, trackWidth, todayX]);

  // Closes the click-to-open detail card on outside click, Escape, or when
  // the timeline scrolls (its fixed position would otherwise go stale).
  useEffect(() => {
    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (trackRef.current?.contains(target) || tooltipRef.current?.contains(target)) return;
      setActiveEvent(null);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveEvent(null);
    };

    const handleScroll = () => setActiveEvent(null);
    const scrollEl = scrollRef.current;

    if (activeEvent) {
      document.addEventListener('pointerdown', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
      scrollEl?.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
      scrollEl?.removeEventListener('scroll', handleScroll);
    };
    // scrollRef is a stable ref object from useDragScroll.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeEvent]);

  const handleEventClick = (event: TimelinePoint, bubbleTop: number, x: number, side: EventSide) => () => {
    setActiveEvent((current) => {
      if (current?.event.id === event.id) return null;

      const trackRect = trackRef.current?.getBoundingClientRect();
      if (!trackRect) return current;

      return { event, top: trackRect.top + bubbleTop, left: trackRect.left + x, side };
    });
  };

  const handlePan = (direction: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.6, behavior: 'smooth' });
  };

  // Remembers which date is at `trackX` (in un-scrolled track pixels) and
  // where on screen (`viewportOffset`, relative to the scroll container) it
  // must stay — read back by the animation-driven scroll effect above.
  const captureZoomAnchor = (trackX: number, viewportOffset: number) => {
    zoomAnchorRef.current = { dayOffset: (trackX - offsetX) / pxPerDay, viewportOffset };
  };

  const handleZoomIn = () => {
    const el = scrollRef.current;
    if (el) {
      const viewportOffset = el.clientWidth / 2;
      captureZoomAnchor(el.scrollLeft + viewportOffset, viewportOffset);
    }
    setZoomIndex((prev) => Math.min(prev + 1, ZOOM_LEVELS.length - 1));
  };

  const handleZoomOut = () => {
    const el = scrollRef.current;
    if (el) {
      const viewportOffset = el.clientWidth / 2;
      captureZoomAnchor(el.scrollLeft + viewportOffset, viewportOffset);
    }
    setZoomIndex((prev) => Math.max(prev - 1, 0));
  };

  // Lets the mouse wheel zoom the timeline instead of scrolling the page.
  // Uses a native (non-passive) listener because React's onWheel is passive
  // by default, so preventDefault() there wouldn't actually stop the page
  // from scrolling. Skipped in compact mode — there, the card sits inside a
  // long scrollable list, and hijacking the wheel would block page scroll
  // every time the cursor happened to be over one of its many timelines.
  useEffect(() => {
    if (compact) return undefined;

    const el = bodyRef.current;
    if (!el) return undefined;

    const handleWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
      event.preventDefault();

      wheelDeltaRef.current += event.deltaY;
      if (Math.abs(wheelDeltaRef.current) < WHEEL_ZOOM_THRESHOLD) return;

      const direction = wheelDeltaRef.current > 0 ? -1 : 1;
      wheelDeltaRef.current = 0;

      const scrollEl = scrollRef.current;
      if (scrollEl) {
        const viewportOffset = event.clientX - scrollEl.getBoundingClientRect().left;
        captureZoomAnchor(scrollEl.scrollLeft + viewportOffset, viewportOffset);
      }

      setZoomIndex((prev) => Math.min(Math.max(prev + direction, 0), ZOOM_LEVELS.length - 1));
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
    // captureZoomAnchor closes over offsetX/pxPerDay, listed below so the
    // listener is re-subscribed (with a fresh closure) whenever they change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact, offsetX, pxPerDay]);

  const showAxis = !isLoading && events.length > 0;

  return (
    <section
      className={`${styles.card} ${compact ? styles.compact : ''} ${className ?? ''}`}
      style={style}
    >
      {compact ? null : (
        <div className={styles.header}>
          <h2 className={styles.heading}>{t.timeline.title}</h2>
        </div>
      )}

      {isLoading ? <span className={styles.state}>{t.timeline.loading}</span> : null}
      {!isLoading && events.length === 0 ? (
        <span className={styles.state}>{t.timeline.empty}</span>
      ) : null}

      {showAxis ? (
        <div className={styles.body} ref={bodyRef}>
          <div className={styles.axisWrap}>
            <button
              type="button"
              className={`${styles.panButton} ${styles.panLeft}`}
              aria-label={t.timeline.scrollPrev}
              onClick={() => handlePan(-1)}
            >
              <ChevronLeftIcon size={compact ? 12 : 16} />
            </button>

            <div
              ref={scrollRef}
              className={`${styles.scrollArea} ${isDragging ? styles.dragging : ''}`}
              {...handlers}
            >
              <div
                ref={trackRef}
                className={styles.track}
                style={{ width: trackWidth, height: size.trackHeight }}
              >
                {monthSegments.map((segment) => (
                  <span
                    key={segment.key}
                    className={styles.line}
                    style={{ top: size.lineY, left: segment.left, width: segment.width }}
                  />
                ))}

                {monthLabels.map((label) => (
                  <span
                    key={label.key}
                    className={styles.monthLabel}
                    style={{ left: label.x, top: size.lineY }}
                  >
                    {label.text}
                  </span>
                ))}

                {yearTicks.map((tick) => (
                  <span
                    key={tick.year}
                    className={styles.yearTick}
                    style={{ left: dateToX(tick.date), top: size.lineY }}
                  >
                    <span className={styles.yearTickMark} />
                    <span className={styles.yearLabel}>{tick.year}</span>
                  </span>
                ))}

                <span className={styles.todayMarker} style={{ left: todayX }}>
                  <span className={styles.todayPill}>{t.timeline.today}</span>
                  <span className={styles.todayLine} style={{ height: size.trackHeight }} />
                  <span className={styles.todayDot} style={{ top: size.lineY }} />
                </span>

                {positionedEvents.map(({ event, x, side, lane }) => {
                  const Icon = EVENT_ICON[event.type];
                  const offset = size.bubbleOffset + lane * size.laneStep;
                  const bubbleTop = side === 'above' ? size.lineY - offset : size.lineY + offset;
                  const stemStyle =
                    side === 'above'
                      ? {
                          top: bubbleTop + size.bubbleRadius,
                          height: size.lineY - (bubbleTop + size.bubbleRadius),
                        }
                      : { top: size.lineY, height: bubbleTop - size.bubbleRadius - size.lineY };
                  const isActive = activeEvent?.event.id === event.id;

                  return (
                    <button
                      key={event.id}
                      type="button"
                      aria-label={getTimelineEventTitle(event)}
                      aria-expanded={isActive}
                      className={`${styles.eventMarker} ${styles[`tone-${event.tone}`]} ${
                        isActive ? styles.eventMarkerActive : ''
                      }`}
                      style={{ left: x }}
                      onClick={handleEventClick(event, bubbleTop, x, side)}
                    >
                      <span className={styles.dot} style={{ top: size.lineY }} />
                      <span className={styles.stem} style={stemStyle} />
                      <span className={styles.bubble} style={{ top: bubbleTop }}>
                        <Icon size={size.iconSize} />
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="button"
              className={`${styles.panButton} ${styles.panRight}`}
              aria-label={t.timeline.scrollNext}
              onClick={() => handlePan(1)}
            >
              <ChevronRightIcon size={compact ? 12 : 16} />
            </button>
          </div>

          <div className={styles.zoomControl}>
            <button
              type="button"
              className={styles.zoomButton}
              aria-label={t.timeline.zoomIn}
              disabled={zoomIndex >= ZOOM_LEVELS.length - 1}
              onClick={handleZoomIn}
            >
              <PlusIcon size={compact ? 11 : 14} />
            </button>
            <div className={styles.zoomTrack}>
              <div
                className={styles.zoomFill}
                style={{ height: `${((zoomIndex + 1) / ZOOM_LEVELS.length) * 100}%` }}
              />
            </div>
            <button
              type="button"
              className={styles.zoomButton}
              aria-label={t.timeline.zoomOut}
              disabled={zoomIndex <= 0}
              onClick={handleZoomOut}
            >
              <MinusIcon size={compact ? 11 : 14} />
            </button>
          </div>
        </div>
      ) : null}

      {activeEvent ? (
        <div
          ref={tooltipRef}
          className={styles.clickTooltip}
          data-side={activeEvent.side}
          style={{
            top:
              activeEvent.side === 'above'
                ? activeEvent.top - size.tooltipGap
                : activeEvent.top + size.tooltipGap,
            left: activeEvent.left,
          }}
        >
          <span className={styles.tooltipKind}>
            {getTimelineEventKindLabel(activeEvent.event, t)}
          </span>
          <span className={styles.tooltipTitle}>{getTimelineEventTitle(activeEvent.event)}</span>
          <span className={styles.tooltipSubtitle}>
            {getTimelineEventSubtitle(activeEvent.event, t, currency)}
          </span>
          <span className={styles.tooltipDate}>{formatDate(activeEvent.event.date)}</span>
        </div>
      ) : null}
    </section>
  );
};
