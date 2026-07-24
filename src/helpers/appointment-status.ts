import type { AppointmentStatus } from '@/common/types/appointment';
import type { BadgeColor } from '@/components/ui';

// Labels live in the locale dictionary (t.appointmentStatus); only colors here.
export const appointmentStatusColor: Record<AppointmentStatus, BadgeColor> = {
  pending: 'primary',
  confirmed: 'primary',
  arrived: 'gray',
  in_treatment: 'gray',
  completed: 'success',
  cancelled: 'danger',
  no_show: 'danger',
};

export const formatMoney = (value: string): string => {
  const amount = Number(value);
  if (Number.isNaN(amount)) return `${value} ₽`;
  return `${amount.toLocaleString('ru-RU')} ₽`;
};
