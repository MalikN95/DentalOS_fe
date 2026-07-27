'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiToothState, ToothCondition } from '@/common/types/dental-chart';
import styles from './ToothChart.module.css';

// FDI notation, laid out left-to-right as conventionally drawn (patient's right side on the left)
const UPPER_TEETH = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_TEETH = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];

const CONDITION_CLASS: Record<ToothCondition, string> = {
  healthy: '',
  caries: styles.caries,
  filling: styles.filling,
  crown: styles.crown,
  implant: styles.implant,
  extracted: styles.extracted,
  other: styles.other,
};

// Ellipse radii (percent of the oval's own box) and the angular margin kept
// clear at the left/right "corners of the mouth" so the two arches meet
// closely there without visually overlapping. Equal angle steps land closer
// together (in real pixels) near the top/bottom than near the sides, so the
// fixed .tooth size in the CSS is tuned to stay smaller than the tightest gap
// (around 11/21 and 41/31) at this RX/RY/ARC_MARGIN combination.
const RX = 42;
const RY = 46;
const ARC_MARGIN = 8;

type ToothPoint = { tooth: number; left: number; top: number };

const archPositions = (teeth: number[], side: 'upper' | 'lower'): ToothPoint[] => {
  const span = 180 - ARC_MARGIN * 2;

  return teeth.map((tooth, index) => {
    const angleDeg = 180 - ARC_MARGIN - (index / (teeth.length - 1)) * span;
    const angleRad = (angleDeg * Math.PI) / 180;
    const verticalOffset = RY * Math.sin(angleRad);

    return {
      tooth,
      left: 50 + RX * Math.cos(angleRad),
      top: side === 'upper' ? 50 - verticalOffset : 50 + verticalOffset,
    };
  });
};

const UPPER_POSITIONS = archPositions(UPPER_TEETH, 'upper');
const LOWER_POSITIONS = archPositions(LOWER_TEETH, 'lower');

type ToothChartProps = {
  /** Selected tooth, only meaningful when `onSelect` makes this a picker. */
  value?: number | null;
  chart?: ApiToothState[];
  disabled?: boolean;
  /** 'sm' renders a smaller oval, e.g. inside a compact profile card. 'lg' renders a bigger one, e.g. inside a fullscreen editor modal. */
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  style?: React.CSSProperties;
  /** Omit to render a read-only chart (e.g. the patient profile card). */
  onSelect?: (toothNumber: number) => void;
};

export const ToothChart = ({
  value = null,
  chart = [],
  disabled = false,
  size = 'md',
  className,
  style,
  onSelect,
}: ToothChartProps) => {
  const { t: dict } = useTranslation();
  const t = dict.dentalChart;
  const conditionByTooth = new Map(chart.map((state) => [state.toothNumber, state.condition]));

  const renderTooth = ({ tooth, left, top }: ToothPoint) => {
    const condition = conditionByTooth.get(tooth);
    const toothClassName = [
      styles.tooth,
      size === 'lg' ? styles.toothLarge : '',
      size === 'sm' ? styles.toothSmall : '',
      tooth === value ? styles.toothSelected : '',
      condition ? CONDITION_CLASS[condition] : '',
    ]
      .filter(Boolean)
      .join(' ');
    const positionStyle: React.CSSProperties = { left: `${left}%`, top: `${top}%` };

    if (!onSelect) {
      return (
        <span key={tooth} className={toothClassName} style={positionStyle}>
          {tooth}
        </span>
      );
    }

    return (
      <button
        key={tooth}
        type="button"
        disabled={disabled}
        className={toothClassName}
        style={positionStyle}
        onClick={() => onSelect(tooth)}
      >
        {tooth}
      </button>
    );
  };

  return (
    <div
      className={`${styles.wrapper} ${size === 'sm' ? styles.wrapperSmall : ''} ${className ?? ''}`}
      style={style}
    >
      <span className={styles.jawLabel}>{t.jawUpper}</span>

      <div
        className={`${styles.oval} ${size === 'lg' ? styles.ovalLarge : ''} ${
          size === 'sm' ? styles.ovalSmall : ''
        }`}
      >
        <span className={styles.crossV} aria-hidden="true" />
        <span className={styles.crossH} aria-hidden="true" />
        {UPPER_POSITIONS.map(renderTooth)}
        {LOWER_POSITIONS.map(renderTooth)}
      </div>

      <span className={styles.jawLabel}>{t.jawLower}</span>

      <div className={`${styles.legend} ${size === 'sm' ? styles.legendSmall : ''}`}>
        <span className={`${styles.legendItem} ${styles.caries}`}>{t.condition.caries}</span>
        <span className={`${styles.legendItem} ${styles.filling}`}>{t.condition.filling}</span>
        <span className={`${styles.legendItem} ${styles.crown}`}>{t.condition.crown}</span>
        <span className={`${styles.legendItem} ${styles.implant}`}>{t.condition.implant}</span>
        <span className={`${styles.legendItem} ${styles.extracted}`}>
          {t.condition.extracted}
        </span>
        <span className={`${styles.legendItem} ${styles.other}`}>{t.condition.other}</span>
      </div>
    </div>
  );
};
