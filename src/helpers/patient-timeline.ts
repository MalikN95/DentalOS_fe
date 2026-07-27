import type { AppointmentStatus } from '@/common/types/appointment';
import type { Dictionary } from '@/common/locale/dictionaries/ru';
import type { ApiInvoice, InvoiceStatus } from '@/common/types/finance';
import type { TimelinePoint, TimelineTone } from '@/common/types/timeline';
import type { Visit } from '@/common/types/visit';
import { formatMoney } from './appointment-status';

const APPOINTMENT_TONE: Record<AppointmentStatus, TimelineTone> = {
  pending: 'pending',
  confirmed: 'pending',
  arrived: 'pending',
  in_treatment: 'pending',
  completed: 'success',
  cancelled: 'cancelled',
  no_show: 'cancelled',
};

const INVOICE_TONE: Record<InvoiceStatus, TimelineTone> = {
  pending: 'pending',
  partially_paid: 'pending',
  paid: 'success',
  refunded: 'neutral',
  cancelled: 'cancelled',
};

type BuildPatientTimelineArgs = {
  visits: Visit[];
  invoices: ApiInvoice[];
};

// Real system events only (appointments, their clinical record, invoices) —
// there's no call/SMS/letter logging in the backend yet.
export const buildPatientTimeline = ({
  visits,
  invoices,
}: BuildPatientTimelineArgs): TimelinePoint[] => {
  const appointmentPoints: TimelinePoint[] = visits.map((visit) => ({
    id: `appointment-${visit.id}`,
    type: 'appointment',
    date: visit.startsAt,
    tone: APPOINTMENT_TONE[visit.status],
    status: visit.status,
    serviceName: visit.serviceName,
    doctorName: visit.doctorName,
  }));

  const recordPoints: TimelinePoint[] = visits
    .filter(
      (visit): visit is Visit & { record: NonNullable<Visit['record']> } => visit.record !== null,
    )
    .map((visit) => ({
      id: `record-${visit.record.id}`,
      type: 'record',
      date: visit.record.createdAt,
      tone: 'success',
      diagnosis: visit.record.diagnosis,
    }));

  const invoicePoints: TimelinePoint[] = invoices.map((invoice) => ({
    id: `invoice-${invoice.id}`,
    type: 'invoice',
    date: invoice.createdAt,
    tone: INVOICE_TONE[invoice.status],
    status: invoice.status,
    number: invoice.number,
    total: invoice.total,
  }));

  return [...appointmentPoints, ...recordPoints, ...invoicePoints].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime(),
  );
};

export const getTimelineEventKindLabel = (point: TimelinePoint, t: Dictionary): string => {
  if (point.type === 'appointment') return t.timeline.appointmentType;
  if (point.type === 'record') return t.timeline.recordType;
  return t.timeline.invoiceType;
};

export const getTimelineEventTitle = (point: TimelinePoint): string => {
  if (point.type === 'appointment') return point.serviceName;
  if (point.type === 'record') return point.diagnosis;
  return `№ ${point.number}`;
};

export const getTimelineEventSubtitle = (
  point: TimelinePoint,
  t: Dictionary,
  currency: string,
): string => {
  if (point.type === 'appointment')
    return `${point.doctorName} · ${t.appointmentStatus[point.status]}`;
  if (point.type === 'record') return t.visits.diagnosis;
  return `${formatMoney(point.total, currency)} · ${t.finance.status[point.status]}`;
};
