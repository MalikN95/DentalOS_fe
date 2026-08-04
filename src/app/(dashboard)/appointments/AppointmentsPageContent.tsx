'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Appointment, AppointmentsViewMode } from '@/common/types/appointment';
import { AppointmentManageModal } from '@/components/dashboard/AppointmentManageModal/AppointmentManageModal';
import { AppointmentsBoard } from '@/components/dashboard/AppointmentsBoard/AppointmentsBoard';
import { AppointmentsCalendarNav } from '@/components/dashboard/AppointmentsCalendarNav/AppointmentsCalendarNav';
import { AppointmentsMonthView } from '@/components/dashboard/AppointmentsMonthView/AppointmentsMonthView';
import { AppointmentsWeekBoard } from '@/components/dashboard/AppointmentsWeekBoard/AppointmentsWeekBoard';
import { AppointmentsYearView } from '@/components/dashboard/AppointmentsYearView/AppointmentsYearView';
import { CreateAppointmentModal } from '@/components/dashboard/CreateAppointmentModal/CreateAppointmentModal';
import { PatientQuickViewModal } from '@/components/patients/PatientQuickViewModal/PatientQuickViewModal';
import { formatHourLabel } from '@/helpers/appointments-board';
import { addDays, addMonths, addWeeks, addYears } from '@/helpers/date';
import {
  APPOINTMENTS_BY_VIEW_QUERY_KEY,
  useAppointmentsByView,
} from '@/hooks/useAppointmentsByView';
import { useClinic } from '@/hooks/useClinic';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './page.module.css';

const STEP_BY_VIEW: Record<AppointmentsViewMode, (date: Date, amount: number) => Date> = {
  day: addDays,
  week: addWeeks,
  month: addMonths,
  year: addYears,
};

export const AppointmentsPageContent = () => {
  const queryClient = useQueryClient();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createModalHour, setCreateModalHour] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<AppointmentsViewMode>('day');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [viewingPatientId, setViewingPatientId] = useState<string | null>(null);
  const [managingAppointment, setManagingAppointment] = useState<Appointment | null>(null);
  const { data, isLoading, error } = useAppointmentsByView(viewMode, selectedDate);
  const { data: clinic } = useClinic();
  const currentUser = useAppSelector(selectCurrentUser);
  const currency = clinic?.currency ?? 'RUB';
  // A doctor only ever sees their own appointments, so filtering "by doctor" is meaningless for them.
  const showDoctorFilter = currentUser?.role !== 'doctor';

  const handleOpenCreateModal = useCallback((hour?: number) => {
    setCreateModalHour(hour);
    setIsCreateModalOpen(true);
  }, []);

  const handleCloseCreateModal = useCallback(() => {
    setIsCreateModalOpen(false);
  }, []);

  const handlePrev = useCallback(() => {
    setSelectedDate((date) => STEP_BY_VIEW[viewMode](date, -1));
  }, [viewMode]);

  const handleNext = useCallback(() => {
    setSelectedDate((date) => STEP_BY_VIEW[viewMode](date, 1));
  }, [viewMode]);

  const handleToday = useCallback(() => {
    setSelectedDate(new Date());
  }, []);

  // Jumping to a specific day from the month/year grid (or a week column
  // header) always drops into Day view — that's the only view a single date
  // makes sense in.
  const handleSelectDay = useCallback((date: Date) => {
    setSelectedDate(date);
    setViewMode('day');
  }, []);

  const handleAppointmentsInvalidate = useCallback(() => {
    queryClient
      .invalidateQueries({ queryKey: APPOINTMENTS_BY_VIEW_QUERY_KEY })
      .catch(() => undefined);
  }, [queryClient]);

  return (
    <div className={styles.page}>
      <AppointmentsCalendarNav
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        date={selectedDate}
        onPrev={handlePrev}
        onNext={handleNext}
        onToday={handleToday}
        onSelectDate={setSelectedDate}
      />

      {viewMode === 'day' ? (
        <AppointmentsBoard
          className={styles.tableSection}
          appointments={data ?? []}
          currency={currency}
          date={selectedDate}
          isLoading={isLoading}
          errorMessage={error?.message ?? null}
          onAddClick={handleOpenCreateModal}
          onPatientClick={setViewingPatientId}
          onRowClick={setManagingAppointment}
          showDoctorFilter={showDoctorFilter}
        />
      ) : null}

      {viewMode === 'week' ? (
        <AppointmentsWeekBoard
          className={styles.tableSection}
          appointments={data ?? []}
          date={selectedDate}
          isLoading={isLoading}
          errorMessage={error?.message ?? null}
          onDayClick={handleSelectDay}
          onCardClick={setManagingAppointment}
          showDoctorFilter={showDoctorFilter}
        />
      ) : null}

      {viewMode === 'month' ? (
        <AppointmentsMonthView
          className={styles.tableSection}
          appointments={data ?? []}
          date={selectedDate}
          isLoading={isLoading}
          errorMessage={error?.message ?? null}
          onSelectDay={handleSelectDay}
          showDoctorFilter={showDoctorFilter}
        />
      ) : null}

      {viewMode === 'year' ? (
        <AppointmentsYearView
          className={styles.tableSection}
          appointments={data ?? []}
          date={selectedDate}
          isLoading={isLoading}
          errorMessage={error?.message ?? null}
          onSelectDay={handleSelectDay}
          showDoctorFilter={showDoctorFilter}
        />
      ) : null}

      {isCreateModalOpen ? (
        <CreateAppointmentModal
          initialDate={selectedDate}
          initialTime={createModalHour !== undefined ? formatHourLabel(createModalHour) : undefined}
          onClose={handleCloseCreateModal}
          onSuccess={handleAppointmentsInvalidate}
        />
      ) : null}
      {viewingPatientId ? (
        <PatientQuickViewModal
          patientId={viewingPatientId}
          onClose={() => setViewingPatientId(null)}
        />
      ) : null}
      {managingAppointment ? (
        <AppointmentManageModal
          appointment={managingAppointment}
          onClose={() => setManagingAppointment(null)}
          onChanged={handleAppointmentsInvalidate}
        />
      ) : null}
    </div>
  );
};
