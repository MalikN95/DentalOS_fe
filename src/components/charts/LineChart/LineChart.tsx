'use client';

import { useMemo } from 'react';
import type { ScriptableContext, TooltipItem } from 'chart.js';
import { Line } from 'react-chartjs-2';
import '@/components/charts/chartjs-setup';
import { readCssVar } from '@/helpers/css-vars';
import styles from './LineChart.module.css';

export type ChartPoint = {
  label: string;
  value: number;
};

type LineChartProps = {
  points: ChartPoint[];
  colorVar?: string;
  formatValue?: (value: number) => string;
  className?: string;
  style?: React.CSSProperties;
};

export const LineChart = ({
  points,
  colorVar = '--color-primary-500',
  formatValue = (value) => String(value),
  className,
  style,
}: LineChartProps) => {
  const data = useMemo(
    () => ({
      labels: points.map((point) => point.label),
      datasets: [
        {
          data: points.map((point) => point.value),
          borderColor: readCssVar(colorVar),
          backgroundColor: (context: ScriptableContext<'line'>) => {
            const { ctx, chartArea } = context.chart;
            if (!chartArea) return undefined;

            const color = readCssVar(colorVar);
            const gradient = ctx.createLinearGradient(0, chartArea.top, 0, chartArea.bottom);
            gradient.addColorStop(0, `${color}33`);
            gradient.addColorStop(1, `${color}00`);
            return gradient;
          },
          fill: true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: readCssVar('--color-white'),
          pointBorderColor: readCssVar(colorVar),
          pointBorderWidth: 2,
          pointHitRadius: 16,
        },
      ],
    }),
    [points, colorVar],
  );

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: readCssVar('--color-black-700'),
          padding: 10,
          cornerRadius: 8,
          displayColors: false,
          titleFont: { size: 11 },
          bodyFont: { size: 13, weight: 600 as const },
          callbacks: {
            label: (context: TooltipItem<'line'>) => formatValue(context.parsed.y ?? 0),
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          border: { display: false },
          ticks: { color: readCssVar('--color-black-500'), font: { size: 11 } },
        },
        y: {
          display: false,
          beginAtZero: true,
        },
      },
    }),
    [formatValue],
  );

  return (
    <div className={`${styles.wrap} ${className ?? ''}`} style={style}>
      <Line data={data} options={options} />
    </div>
  );
};
