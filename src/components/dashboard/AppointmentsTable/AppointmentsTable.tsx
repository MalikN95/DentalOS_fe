'use client';

import { Fragment, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { Appointment } from '@/common/types/appointment';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { CalendarIcon, ChevronLeftIcon, ChevronRightIcon } from '@/components/icons/icons';
import { Alert, Badge, Button } from '@/components/ui';
import {
  appointmentStatusColor,
  findFirstUpcomingIndex,
  findNextAppointmentId,
} from '@/helpers/appointment-status';
import { isSameDay, parseDateInputValue, toDateInputValue } from '@/helpers/date';
import { useDragScroll } from '@/hooks/useDragScroll';
import styles from './AppointmentsTable.module.css';

type AppointmentsTableDateNav = {
  date: Date;
  onPrevDay: () => void;
  onNextDay: () => void;
  onSelectDate: (date: Date) => void;
};

type AppointmentsTableProps = {
  appointments: Appointment[];
  isLoading?: boolean;
  errorMessage?: string | null;
  className?: string;
  style?: React.CSSProperties;
  onAddClick?: () => void;
  onPatientClick?: (patientId: string) => void;
  onRowClick?: (appointment: Appointment) => void;
  dateNav?: AppointmentsTableDateNav;
};

export const AppointmentsTable = ({
  appointments,
  isLoading = false,
  errorMessage = null,
  className,
  style,
  onAddClick,
  onPatientClick,
  onRowClick,
  dateNav,
}: AppointmentsTableProps) => {
  const { t, language } = useTranslation();
  const nextAppointmentId = useMemo(() => findNextAppointmentId(appointments), [appointments]);
  const firstUpcomingIndex = useMemo(() => findFirstUpcomingIndex(appointments), [appointments]);
  const nextRowRef = useRef<HTMLTableRowElement | null>(null);
  const nextCardRef = useRef<HTMLDivElement | null>(null);
  const {
    ref: tableWrapRef,
    isDragging: isTableDragging,
    handlers: dragScrollHandlers,
  } = useDragScroll<HTMLDivElement>();

  const rows = useMemo(
    () =>
      appointments.map((appointment, index) => ({
        appointment,
        isNext: appointment.id === nextAppointmentId,
        showUpcomingDivider: index === firstUpcomingIndex,
      })),
    [appointments, nextAppointmentId, firstUpcomingIndex],
  );
  const showLoading = isLoading;
  const showEmpty = !isLoading && appointments.length === 0;

  useEffect(() => {
    if (nextAppointmentId) {
      nextRowRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      nextCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [nextAppointmentId]);

  return (
    <div className={`${styles.card} ${className ?? ''}`} style={style}>
      <div className={styles.cardHeader}>
        {dateNav ? (
          <div className={styles.dateNav}>
            <button
              type="button"
              className={styles.navButton}
              onClick={dateNav.onPrevDay}
              aria-label={t.appointments.prevDay}
            >
              <ChevronLeftIcon size={16} />
            </button>
            <span className={styles.dateLabel}>
              {isSameDay(dateNav.date, new Date())
                ? t.appointments.today
                : dateNav.date.toLocaleDateString(language, {
                    day: 'numeric',
                    month: 'long',
                    weekday: 'short',
                  })}
            </span>
            <button
              type="button"
              className={styles.navButton}
              onClick={dateNav.onNextDay}
              aria-label={t.appointments.nextDay}
            >
              <ChevronRightIcon size={16} />
            </button>
            <span className={styles.calendarTrigger}>
              <CalendarIcon size={15} className={styles.calendarIcon} />
              <input
                type="date"
                className={styles.calendarInput}
                value={toDateInputValue(dateNav.date)}
                aria-label={t.appointments.pickDate}
                onChange={(event) => {
                  if (event.target.value) {
                    dateNav.onSelectDate(parseDateInputValue(event.target.value));
                  }
                }}
              />
            </span>
          </div>
        ) : (
          <span className={styles.cardTitle}>{t.appointments.todayTitle}</span>
        )}
        <Button variant="soft" onClick={onAddClick}>
          {t.appointments.newAppointment}
        </Button>
      </div>

      {errorMessage ? (
        <div className={styles.stateWrap}>
          <Alert color="danger">{errorMessage}</Alert>
        </div>
      ) : null}

      <div
        ref={tableWrapRef}
        className={`${styles.tableWrap} ${isTableDragging ? styles.dragging : ''}`}
        {...dragScrollHandlers}
      >
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t.appointments.colTime}</th>
              <th>{t.appointments.colPatient}</th>
              <th>{t.appointments.colService}</th>
              <th>{t.appointments.colDoctor}</th>
              <th>{t.appointments.colCabinet}</th>
              <th>{t.appointments.colStatus}</th>
              <th>{t.appointments.colActions}</th>
            </tr>
          </thead>
          <tbody>
            {showLoading ? (
              <tr>
                <td className={styles.stateCell} colSpan={7}>
                  {t.appointments.loading}
                </td>
              </tr>
            ) : null}

            {showEmpty ? (
              <tr>
                <td className={styles.stateCell} colSpan={7}>
                  {t.appointments.empty}
                </td>
              </tr>
            ) : null}

            {!showLoading
              ? rows.map(({ appointment, isNext, showUpcomingDivider }) => (
                  <Fragment key={appointment.id}>
                    {showUpcomingDivider ? (
                      <tr>
                        <td className={styles.divider} colSpan={7}>
                          <CalendarIcon size={13} className={styles.dividerIcon} />
                          {t.appointments.upcomingDivider}
                        </td>
                      </tr>
                    ) : null}
                    <tr
                      ref={isNext ? nextRowRef : undefined}
                      className={`${isNext ? styles.rowNext : ''} ${onRowClick ? styles.rowClickable : ''}`}
                      onClick={onRowClick ? () => onRowClick(appointment) : undefined}
                    >
                      <td className={styles.time}>
                        {appointment.time}
                        {isNext ? (
                          <button
                            type="button"
                            className={styles.nextHint}
                            aria-label={t.appointments.nextHint}
                            title={t.appointments.nextHint}
                          >
                            <span className={styles.nextDot} />
                            <span className={styles.nextTooltip} role="tooltip">
                              {t.appointments.nextHint}
                            </span>
                          </button>
                        ) : null}
                      </td>
                      <td>
                        <span className={styles.patient}>
                          <button
                            type="button"
                            className={styles.patientName}
                            onClick={(event) => {
                              event.stopPropagation();
                              onPatientClick?.(appointment.patientId);
                            }}
                          >
                            {appointment.patientName}
                          </button>
                          <span className={styles.patientPhone}>{appointment.patientPhone}</span>
                        </span>
                      </td>
                      <td>{appointment.service}</td>
                      <td>{appointment.doctorName}</td>
                      <td>{appointment.cabinet}</td>
                      <td>
                        <Badge color={appointmentStatusColor[appointment.status]}>
                          {t.appointmentStatus[appointment.status]}
                        </Badge>
                      </td>
                      <td>
                        <Link
                          href={`/appointments/${appointment.id}`}
                          className={styles.detailsLink}
                          onClick={(event) => event.stopPropagation()}
                        >
                          {t.appointments.viewDetails}
                        </Link>
                      </td>
                    </tr>
                  </Fragment>
                ))
              : null}
          </tbody>
        </table>
      </div>

      <div className={styles.mobileList}>
        {showLoading ? (
          <div className={styles.mobileStateBlock}>{t.appointments.loading}</div>
        ) : null}
        {showEmpty ? <div className={styles.mobileStateBlock}>{t.appointments.empty}</div> : null}

        {!showLoading
          ? rows.map(({ appointment, isNext, showUpcomingDivider }) => (
              <Fragment key={appointment.id}>
                {showUpcomingDivider ? (
                  <div className={styles.mobileDivider}>
                    <CalendarIcon size={13} />
                    {t.appointments.upcomingDivider}
                  </div>
                ) : null}
                <div
                  ref={isNext ? nextCardRef : undefined}
                  className={`${styles.mobileCard} ${isNext ? styles.mobileCardNext : ''} ${onRowClick ? styles.mobileCardClickable : ''}`}
                  role="button"
                  tabIndex={0}
                  onClick={() => onRowClick?.(appointment)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      onRowClick?.(appointment);
                    }
                  }}
                >
                  <div className={styles.mobileCardHead}>
                    <span className={styles.time}>
                      {appointment.time}
                      {isNext ? (
                        <button
                          type="button"
                          className={styles.nextHint}
                          aria-label={t.appointments.nextHint}
                          title={t.appointments.nextHint}
                        >
                          <span className={styles.nextDot} />
                        </button>
                      ) : null}
                    </span>
                    <Badge color={appointmentStatusColor[appointment.status]}>
                      {t.appointmentStatus[appointment.status]}
                    </Badge>
                  </div>

                  <span className={styles.patient}>
                    <button
                      type="button"
                      className={styles.patientName}
                      onClick={(event) => {
                        event.stopPropagation();
                        onPatientClick?.(appointment.patientId);
                      }}
                    >
                      {appointment.patientName}
                    </button>
                    <span className={styles.patientPhone}>{appointment.patientPhone}</span>
                  </span>

                  <div className={styles.mobileMeta}>
                    <div className={styles.mobileMetaItem}>
                      <span className={styles.mobileMetaLabel}>{t.appointments.colService}</span>
                      <span className={styles.mobileMetaValue}>{appointment.service}</span>
                    </div>
                    <div className={styles.mobileMetaItem}>
                      <span className={styles.mobileMetaLabel}>{t.appointments.colDoctor}</span>
                      <span className={styles.mobileMetaValue}>{appointment.doctorName}</span>
                    </div>
                    <div className={styles.mobileMetaItem}>
                      <span className={styles.mobileMetaLabel}>{t.appointments.colCabinet}</span>
                      <span className={styles.mobileMetaValue}>{appointment.cabinet}</span>
                    </div>
                  </div>

                  <Link
                    href={`/appointments/${appointment.id}`}
                    className={styles.detailsLink}
                    onClick={(event) => event.stopPropagation()}
                  >
                    {t.appointments.viewDetails}
                  </Link>
                </div>
              </Fragment>
            ))
          : null}
      </div>
    </div>
  );
};
