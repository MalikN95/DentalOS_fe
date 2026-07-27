'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
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
import { addDays, daysBetween, formatDate, startOfDay } from '@/helpers/date';
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
const BUBBLE_OFFSET = 58;
const BUBBLE_RADIUS = 17;
// Two events closer than this (px) would visually touch, so they're pushed
// into separate stacking lanes instead of drawn on top of each other.
const MIN_EVENT_GAP = BUBBLE_RADIUS * 2 + 10;
const LANE_STEP = 40;
const MAX_LANE = 1;
// Just enough headroom for the farthest lane's bubble on each side.
const LINE_Y = BUBBLE_OFFSET + MAX_LANE * LANE_STEP + 20;
const TRACK_HEIGHT = LINE_Y * 2;
// Gap between a bubble's edge and its click-to-open detail card.
const TOOLTIP_GAP = BUBBLE_RADIUS + 10;

type EventSide = 'above' | 'below';

// Places closely-spaced events into stacking lanes (above/below the line) so
// clustered dates — e.g. a visit's appointment + record + invoice on the same
// day — don't render as one unreadable pile of overlapping bubbles.
const layoutEvents = <T,>(
  items: T[],
  getX: (item: T) => number,
): { item: T; x: number; side: EventSide; lane: number }[] => {
  const laneLastX: Record<EventSide, number[]> = { above: [], below: [] };

  const findLane = (side: EventSide, x: number) => {
    const lastX = laneLastX[side];
    for (let lane = 0; lane <= MAX_LANE; lane += 1) {
      if (lastX[lane] === undefined || x - lastX[lane] >= MIN_EVENT_GAP) return lane;
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
  className?: string;
  style?: React.CSSProperties;
};

export const PatientTimeline = ({
  events,
  currency = 'RUB',
  isLoading = false,
  className,
  style,
}: PatientTimelineProps) => {
  const { t } = useTranslation();
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX);
  const { ref: scrollRef, isDragging, handlers } = useDragScroll<HTMLDivElement>();
  const trackRef = useRef<HTMLDivElement | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
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

  const pxPerDay = ZOOM_LEVELS[zoomIndex];
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

  const positionedEvents = useMemo(
    () =>
      layoutEvents(events, (event) => daysBetween(rangeStart, new Date(event.date)) * pxPerDay).map(
        ({ item, x, side, lane }) => ({ event: item, x: x + offsetX, side, lane }),
      ),
    [events, rangeStart, pxPerDay, offsetX],
  );

  // Center the viewport on "today" once the track is measured, and again
  // whenever zoom changes, so zooming stays anchored on "now" instead of drifting.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollLeft = Math.max(todayX - el.clientWidth / 2, 0);
    // scrollRef is a stable ref object; todayX is derived from pxPerDay/trackWidth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pxPerDay, trackWidth]);

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

  const handleZoomIn = () => setZoomIndex((prev) => Math.min(prev + 1, ZOOM_LEVELS.length - 1));
  const handleZoomOut = () => setZoomIndex((prev) => Math.max(prev - 1, 0));

  const showAxis = !isLoading && events.length > 0;

  return (
    <section className={`${styles.card} ${className ?? ''}`} style={style}>
      <div className={styles.header}>
        <h2 className={styles.heading}>{t.timeline.title}</h2>
      </div>

      {isLoading ? <span className={styles.state}>{t.timeline.loading}</span> : null}
      {!isLoading && events.length === 0 ? (
        <span className={styles.state}>{t.timeline.empty}</span>
      ) : null}

      {showAxis ? (
        <div className={styles.body}>
          <div className={styles.axisWrap}>
            <button
              type="button"
              className={`${styles.panButton} ${styles.panLeft}`}
              aria-label={t.timeline.scrollPrev}
              onClick={() => handlePan(-1)}
            >
              <ChevronLeftIcon size={16} />
            </button>

            <div
              ref={scrollRef}
              className={`${styles.scrollArea} ${isDragging ? styles.dragging : ''}`}
              {...handlers}
            >
              <div
                ref={trackRef}
                className={styles.track}
                style={{ width: trackWidth, height: TRACK_HEIGHT }}
              >
                <span className={styles.line} style={{ top: LINE_Y }} />

                {monthTicks.map((date) => (
                  <span
                    key={date.getTime()}
                    className={styles.monthTick}
                    style={{ left: dateToX(date), height: TRACK_HEIGHT }}
                  />
                ))}

                {yearTicks.map((tick) => (
                  <span
                    key={tick.year}
                    className={styles.yearTick}
                    style={{ left: dateToX(tick.date), top: LINE_Y }}
                  >
                    <span className={styles.yearTickMark} />
                    <span className={styles.yearLabel}>{tick.year}</span>
                  </span>
                ))}

                <span className={styles.todayMarker} style={{ left: todayX }}>
                  <span className={styles.todayPill}>{t.timeline.today}</span>
                  <span className={styles.todayLine} style={{ height: TRACK_HEIGHT }} />
                  <span className={styles.todayDot} style={{ top: LINE_Y }} />
                </span>

                {positionedEvents.map(({ event, x, side, lane }) => {
                  const Icon = EVENT_ICON[event.type];
                  const offset = BUBBLE_OFFSET + lane * LANE_STEP;
                  const bubbleTop = side === 'above' ? LINE_Y - offset : LINE_Y + offset;
                  const stemStyle =
                    side === 'above'
                      ? {
                          top: bubbleTop + BUBBLE_RADIUS,
                          height: LINE_Y - (bubbleTop + BUBBLE_RADIUS),
                        }
                      : { top: LINE_Y, height: bubbleTop - BUBBLE_RADIUS - LINE_Y };
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
                      <span className={styles.dot} style={{ top: LINE_Y }} />
                      <span className={styles.stem} style={stemStyle} />
                      <span className={styles.bubble} style={{ top: bubbleTop }}>
                        <Icon size={16} />
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
              <ChevronRightIcon size={16} />
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
              <PlusIcon size={14} />
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
              <MinusIcon size={14} />
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
                ? activeEvent.top - TOOLTIP_GAP
                : activeEvent.top + TOOLTIP_GAP,
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
