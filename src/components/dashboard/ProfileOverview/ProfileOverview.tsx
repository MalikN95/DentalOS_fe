'use client';

import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { Appointment } from '@/common/types/appointment';
import { CalendarIcon, MessageIcon, StarIcon } from '@/components/icons/icons';
import { StatCard } from '@/components/dashboard/StatCard/StatCard';
import { formatMonthLabel, getMonthMatrix, isSameDay, toDateInputValue } from '@/helpers/date';
import { groupAppointmentsByDate, summarizeAppointmentsByOutcome } from '@/helpers/appointments-board';
import type { useProfileOverview } from '@/hooks/useProfileOverview';
import styles from './ProfileOverview.module.css';

const WEEKDAY_ORDER = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const;
const DONUT_RADIUS = 40;
const DONUT_CIRCUMFERENCE = 2 * Math.PI * DONUT_RADIUS;

const MiniMonthCalendar = ({ appointments }: { appointments: Appointment[] }) => {
  const { t } = useTranslation();
  const today = new Date();
  const appointmentsByDate = groupAppointmentsByDate(appointments);

  return (
    <div className={styles.widget}>
      <span className={styles.widgetTitle}>
        <CalendarIcon size={14} />
        {t.account.calendarTitle} · {formatMonthLabel(today)}
      </span>

      <div className={styles.weekdayRow}>
        {WEEKDAY_ORDER.map((weekday) => (
          <span key={weekday} className={styles.weekdayLabel}>
            {t.weekdaysShort[weekday].charAt(0)}
          </span>
        ))}
      </div>

      <div className={styles.dayGrid}>
        {getMonthMatrix(today)
          .flat()
          .map((day) => {
            const dayAppointments = appointmentsByDate.get(toDateInputValue(day)) ?? [];
            const summary = summarizeAppointmentsByOutcome(dayAppointments);
            const isCurrentMonth = day.getMonth() === today.getMonth();
            const title = [
              summary.pending > 0
                ? format(t.appointments.pendingCount, { count: summary.pending })
                : null,
              summary.arrived > 0
                ? format(t.appointments.arrivedCount, { count: summary.arrived })
                : null,
              summary.cancelled > 0
                ? format(t.appointments.cancelledCount, { count: summary.cancelled })
                : null,
            ]
              .filter(Boolean)
              .join(', ');

            return (
              <span
                key={toDateInputValue(day)}
                className={`${styles.day} ${isCurrentMonth ? '' : styles.dayOutside} ${
                  isSameDay(day, today) ? styles.dayToday : ''
                }`}
                title={title || undefined}
              >
                {day.getDate()}
                {dayAppointments.length > 0 ? (
                  <span className={styles.dots}>
                    {summary.pending > 0 ? <span className={styles.dot} data-color="primary" /> : null}
                    {summary.arrived > 0 ? <span className={styles.dot} data-color="success" /> : null}
                    {summary.cancelled > 0 ? <span className={styles.dot} data-color="danger" /> : null}
                  </span>
                ) : null}
              </span>
            );
          })}
      </div>
    </div>
  );
};

const CompletionDonut = ({
  summary,
}: {
  summary: { arrived: number; cancelled: number; pending: number };
}) => {
  const { t } = useTranslation();
  const total = summary.arrived + summary.cancelled + summary.pending;

  const segments = [
    { key: 'arrived', count: summary.arrived, color: 'var(--color-green-500)', label: t.appointments.arrivedCount },
    { key: 'cancelled', count: summary.cancelled, color: 'var(--color-red-500)', label: t.appointments.cancelledCount },
    { key: 'pending', count: summary.pending, color: 'var(--color-primary-500)', label: t.appointments.pendingCount },
  ].filter((segment) => segment.count > 0);

  let cumulative = 0;

  return (
    <div className={styles.widget}>
      <span className={styles.widgetTitle}>{t.account.completionTitle}</span>

      {total === 0 ? (
        <p className={styles.emptyState}>{t.account.completionEmpty}</p>
      ) : (
        <div className={styles.donutRow}>
          <svg width={96} height={96} viewBox="0 0 96 96" className={styles.donutChart} role="img">
            <circle
              cx={48}
              cy={48}
              r={DONUT_RADIUS}
              fill="none"
              stroke="var(--color-gray-50)"
              strokeWidth={10}
            />
            {segments.map((segment) => {
              const length = (segment.count / total) * DONUT_CIRCUMFERENCE;
              const dashoffset = -cumulative;
              cumulative += length;

              return (
                <circle
                  key={segment.key}
                  cx={48}
                  cy={48}
                  r={DONUT_RADIUS}
                  fill="none"
                  stroke={segment.color}
                  strokeWidth={10}
                  strokeLinecap="round"
                  strokeDasharray={`${length} ${DONUT_CIRCUMFERENCE - length}`}
                  strokeDashoffset={dashoffset}
                  transform="rotate(-90 48 48)"
                />
              );
            })}
            <text x={48} y={54} textAnchor="middle" className={styles.donutTotal}>
              {total}
            </text>
          </svg>

          <ul className={styles.legend}>
            {segments.map((segment) => (
              <li key={segment.key} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: segment.color }} />
                {format(segment.label, { count: segment.count })}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

type ProfileOverviewProps = Omit<ReturnType<typeof useProfileOverview>, 'upcoming' | 'errorMessage'>;

export const ProfileOverview = ({
  isLoading,
  doctorProfileId,
  weekCount,
  monthCount,
  monthAppointments,
  monthSummary,
  reviews,
}: ProfileOverviewProps) => {
  const { t: dict } = useTranslation();
  const t = dict.account;

  if (isLoading) {
    return <p className={styles.state}>{dict.common.loading}</p>;
  }

  return (
    <div className={styles.overview}>
      <div className={styles.stats}>
        <StatCard label={t.weekCount} value={String(weekCount)} icon={<CalendarIcon size={16} />} />
        <StatCard
          label={t.monthCount}
          value={String(monthCount)}
          icon={<CalendarIcon size={16} />}
          accent="success"
        />
        {doctorProfileId && reviews.averageRating !== null ? (
          <StatCard
            label={t.avgRating}
            value={reviews.averageRating.toFixed(1)}
            icon={<StarIcon size={16} filled />}
            accent="primary"
            changeLabel={format(t.ratingsCount, { count: reviews.total })}
          />
        ) : null}
      </div>

      <div className={styles.grid}>
        <MiniMonthCalendar appointments={monthAppointments} />
        <CompletionDonut summary={monthSummary} />
      </div>

      {doctorProfileId ? (
        <div className={styles.widget}>
          <span className={styles.widgetTitle}>
            <MessageIcon size={13} />
            {t.reviewsTitle}
          </span>

          {reviews.isLoading ? <p className={styles.emptyState}>{dict.common.loading}</p> : null}
          {!reviews.isLoading && reviews.preview.length === 0 ? (
            <p className={styles.emptyState}>{t.reviewsEmpty}</p>
          ) : null}

          <div className={styles.reviewsList}>
            {reviews.preview.map((review) => (
              <div key={review.id} className={styles.reviewItem}>
                <span className={styles.reviewStars} aria-label={`${review.rating}/5`}>
                  {Array.from({ length: 5 }, (_, index) => (
                    <StarIcon
                      key={index}
                      size={12}
                      filled={index < review.rating}
                      className={index < review.rating ? styles.starFilled : styles.starEmpty}
                    />
                  ))}
                </span>
                {review.comment ? <p className={styles.reviewComment}>{review.comment}</p> : null}
                <span className={styles.reviewMeta}>
                  {review.patient.firstName} {review.patient.lastName}
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};
