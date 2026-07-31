'use client';

import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ClockIcon } from '@/components/icons/icons';
import styles from './AnalogTimePicker.module.css';

type AnalogTimePickerProps = {
  label?: string;
  /** 24-hour "HH:mm". */
  value: string;
  onChange: (value: string) => void;
  error?: string;
  className?: string;
  style?: React.CSSProperties;
};

type ClockMode = 'hours' | 'minutes';

const FACE_SIZE = 232;
const CENTER = FACE_SIZE / 2;
const OUTER_RADIUS = 96;
const INNER_RADIUS = 60;
const MINUTE_RADIUS = 96;
const RING_THRESHOLD = (OUTER_RADIUS + INNER_RADIUS) / 2;

const PANEL_GAP = 6;
const PANEL_WIDTH = 264;
const PANEL_HEIGHT = 372;

const pad = (n: number): string => String(n).padStart(2, '0');

const parseValue = (value: string): { hours: number; minutes: number } => {
  const [h, m] = value.split(':').map(Number);
  return {
    hours: Number.isFinite(h) ? h : 0,
    minutes: Number.isFinite(m) ? m : 0,
  };
};

// Position on the face for a 12-slot ring index (0 = top, clockwise), at the
// given angle-from-top in degrees (continuous — not limited to the 12 slots).
const pointAtAngle = (angleFromTopDeg: number, radius: number) => {
  const standardRad = ((angleFromTopDeg - 90) * Math.PI) / 180;
  return {
    x: CENTER + radius * Math.cos(standardRad),
    y: CENTER + radius * Math.sin(standardRad),
  };
};

const pointAtIndex = (index: number, radius: number) => pointAtAngle(index * 30, radius);

// Inverse of pointAtAngle: given a pointer offset from the face center,
// the angle-from-top in degrees (0-360, clockwise).
const angleFromTop = (dx: number, dy: number): number => {
  const standardDeg = Math.atan2(dy, dx) * (180 / Math.PI);
  return (standardDeg + 90 + 360) % 360;
};

// Real 24h analog clocks show 13-23/00 on an inner ring, at the same angle
// as their outer 1-12 counterpart (13 under 1, ..., 23 under 11, 00 under 12).
const outerHourAt = (index: number): number => (index === 0 ? 12 : index);
const innerHourAt = (index: number): number => (index === 0 ? 0 : index + 12);

const hourPosition = (hours: number): { index: number; ring: 'outer' | 'inner' } => {
  if (hours === 0) return { index: 0, ring: 'inner' };
  if (hours === 12) return { index: 0, ring: 'outer' };
  if (hours < 12) return { index: hours, ring: 'outer' };
  return { index: hours - 12, ring: 'inner' };
};

type PanelPosition = { left: number; top?: number; bottom?: number };

const computePanelPosition = (trigger: HTMLElement): PanelPosition => {
  const rect = trigger.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom - PANEL_GAP;
  const openUpward = spaceBelow < PANEL_HEIGHT && rect.top > spaceBelow;
  const left = Math.min(Math.max(8, rect.left), window.innerWidth - PANEL_WIDTH - 8);

  return {
    left,
    top: openUpward ? undefined : rect.bottom + PANEL_GAP,
    bottom: openUpward ? window.innerHeight - rect.top + PANEL_GAP : undefined,
  };
};

const RING_INDEXES = Array.from({ length: 12 }, (_, index) => index);

export const AnalogTimePicker = ({
  label,
  value,
  onChange,
  error,
  className,
  style,
}: AnalogTimePickerProps) => {
  const labelId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const faceRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<ClockMode>('hours');
  const [isDragging, setIsDragging] = useState(false);
  const [panelPosition, setPanelPosition] = useState<PanelPosition | null>(null);

  const { hours, minutes } = parseValue(value);

  useEffect(() => {
    if (!open) return undefined;

    const updatePosition = () => {
      if (triggerRef.current) {
        setPanelPosition(computePanelPosition(triggerRef.current));
      }
    };

    updatePosition();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideTrigger = containerRef.current?.contains(target) ?? false;
      const isInsidePanel = panelRef.current?.contains(target) ?? false;

      if (!isInsideTrigger && !isInsidePanel) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [open]);

  const updateFromPointer = useCallback(
    (clientX: number, clientY: number) => {
      const face = faceRef.current;
      if (!face) return;

      const rect = face.getBoundingClientRect();
      const dx = clientX - (rect.left + rect.width / 2);
      const dy = clientY - (rect.top + rect.height / 2);
      const angle = angleFromTop(dx, dy);

      if (mode === 'hours') {
        const distance = Math.sqrt(dx * dx + dy * dy);
        const index = Math.round(angle / 30) % 12;
        const nextHour = distance < RING_THRESHOLD ? innerHourAt(index) : outerHourAt(index);
        onChange(`${pad(nextHour)}:${pad(minutes)}`);
      } else {
        const index = Math.round(angle / 6) % 60;
        onChange(`${pad(hours)}:${pad(index)}`);
      }
    },
    [mode, hours, minutes, onChange],
  );

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDragging(true);
    updateFromPointer(event.clientX, event.clientY);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    updateFromPointer(event.clientX, event.clientY);
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    setMode((current) => (current === 'hours' ? 'minutes' : current));
  };

  const handleToggleOpen = () => {
    if (!open) {
      // Always land back on the hour ring when reopening.
      setMode('hours');
    }
    setOpen((prev) => !prev);
  };

  const { index: hourIndex, ring: hourRing } = hourPosition(hours);
  const handAngle = mode === 'hours' ? hourIndex * 30 : minutes * 6;
  let handRadius = MINUTE_RADIUS;
  if (mode === 'hours') {
    handRadius = hourRing === 'inner' ? INNER_RADIUS : OUTER_RADIUS;
  }
  const handTip = pointAtAngle(handAngle, handRadius);

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      {label ? (
        <span id={labelId} className={styles.label}>
          {label}
        </span>
      ) : null}

      <div ref={containerRef} className={styles.control}>
        <button
          ref={triggerRef}
          type="button"
          className={`${styles.trigger} ${error ? styles.triggerError : ''}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          aria-labelledby={label ? labelId : undefined}
          onClick={handleToggleOpen}
          onKeyDown={(event) => {
            if (event.key === 'Escape') setOpen(false);
          }}
        >
          <ClockIcon size={16} className={styles.triggerIcon} />
          <span className={styles.triggerValue}>
            {pad(hours)}:{pad(minutes)}
          </span>
        </button>

        {open && panelPosition
          ? createPortal(
              <div
                ref={panelRef}
                className={styles.panel}
                style={{
                  left: panelPosition.left,
                  top: panelPosition.top,
                  bottom: panelPosition.bottom,
                  width: PANEL_WIDTH,
                }}
              >
                <div className={styles.digital}>
                  <button
                    type="button"
                    className={`${styles.digitalSegment} ${
                      mode === 'hours' ? styles.digitalSegmentActive : ''
                    }`}
                    onClick={() => setMode('hours')}
                  >
                    {pad(hours)}
                  </button>
                  <span className={styles.digitalColon}>:</span>
                  <button
                    type="button"
                    className={`${styles.digitalSegment} ${
                      mode === 'minutes' ? styles.digitalSegmentActive : ''
                    }`}
                    onClick={() => setMode('minutes')}
                  >
                    {pad(minutes)}
                  </button>
                </div>

                <div
                  ref={faceRef}
                  className={styles.face}
                  style={{ width: FACE_SIZE, height: FACE_SIZE }}
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerCancel={handlePointerUp}
                >
                  <div className={styles.centerDot} />
                  <div
                    className={styles.hand}
                    style={{
                      height: handRadius,
                      transform: `translateX(-50%) rotate(${handAngle + 180}deg)`,
                    }}
                  />
                  <div className={styles.handDot} style={{ left: handTip.x, top: handTip.y }} />

                  {mode === 'hours'
                    ? RING_INDEXES.flatMap((index) => {
                        const outerValue = outerHourAt(index);
                        const innerValue = innerHourAt(index);
                        const outerPoint = pointAtIndex(index, OUTER_RADIUS);
                        const innerPoint = pointAtIndex(index, INNER_RADIUS);

                        return [
                          <span
                            key={`outer-${index}`}
                            className={`${styles.number} ${
                              hours === outerValue ? styles.numberActive : ''
                            }`}
                            style={{ left: outerPoint.x, top: outerPoint.y }}
                          >
                            {outerValue}
                          </span>,
                          <span
                            key={`inner-${index}`}
                            className={`${styles.number} ${styles.numberInner} ${
                              hours === innerValue ? styles.numberActive : ''
                            }`}
                            style={{ left: innerPoint.x, top: innerPoint.y }}
                          >
                            {pad(innerValue)}
                          </span>,
                        ];
                      })
                    : RING_INDEXES.map((index) => {
                        const minuteValue = index * 5;
                        const point = pointAtIndex(index, MINUTE_RADIUS);

                        return (
                          <span
                            key={`minute-${index}`}
                            className={`${styles.number} ${
                              minutes === minuteValue ? styles.numberActive : ''
                            }`}
                            style={{ left: point.x, top: point.y }}
                          >
                            {pad(minuteValue)}
                          </span>
                        );
                      })}
                </div>
              </div>,
              document.body,
            )
          : null}
      </div>

      {error ? <span className={styles.errorText}>{error}</span> : null}
    </div>
  );
};
