'use client';

import { useMemo } from 'react';
import type { TooltipItem } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import '@/components/charts/chartjs-setup';
import { readCssVar } from '@/helpers/css-vars';
import styles from './DonutChart.module.css';

export type DonutSegment = {
  value: number;
  colorVar: string;
  label: string;
};

type DonutChartProps = {
  segments: DonutSegment[];
  centerValue: string;
  centerLabel: string;
  className?: string;
  style?: React.CSSProperties;
};

export const DonutChart = ({
  segments,
  centerValue,
  centerLabel,
  className,
  style,
}: DonutChartProps) => {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);

  const data = useMemo(
    () => ({
      labels: segments.map((segment) => segment.label),
      datasets: [
        {
          data: segments.map((segment) => segment.value),
          backgroundColor: segments.map((segment) => readCssVar(segment.colorVar)),
          borderColor: readCssVar('--color-white'),
          borderWidth: 3,
          borderRadius: 6,
          hoverOffset: 6,
          spacing: 2,
        },
      ],
    }),
    [segments],
  );

  const options = useMemo(
    () => ({
      cutout: '72%',
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: readCssVar('--color-black-700'),
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          bodyFont: { size: 12, weight: 600 as const },
          callbacks: {
            label: (context: TooltipItem<'doughnut'>) => `${context.label}: ${context.parsed}`,
          },
        },
      },
    }),
    [],
  );

  return (
    <div className={`${styles.wrap} ${className ?? ''}`} style={style}>
      <div className={styles.canvasBox}>
        <Doughnut data={data} options={options} />
        <div className={styles.center} aria-hidden="true">
          <span className={styles.centerValue}>{centerValue}</span>
          <span className={styles.centerLabel}>{centerLabel}</span>
        </div>
      </div>

      <ul className={styles.legend}>
        {segments.map((segment) => (
          <li key={segment.label} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: `var(${segment.colorVar})` }}
              aria-hidden="true"
            />
            <span className={styles.legendLabel}>{segment.label}</span>
            <span className={styles.legendValue}>
              {segment.value}
              {total > 0 ? ` (${Math.round((segment.value / total) * 100)}%)` : ''}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};
