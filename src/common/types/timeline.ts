import type { AppointmentStatus } from './appointment';
import type { InvoiceStatus } from './finance';

export type TimelineTone = 'success' | 'pending' | 'cancelled' | 'neutral';

export type AppointmentTimelinePoint = {
  id: string;
  type: 'appointment';
  date: string;
  tone: TimelineTone;
  status: AppointmentStatus;
  serviceName: string;
  doctorName: string;
};

export type RecordTimelinePoint = {
  id: string;
  type: 'record';
  date: string;
  tone: TimelineTone;
  diagnosis: string;
};

export type InvoiceTimelinePoint = {
  id: string;
  type: 'invoice';
  date: string;
  tone: TimelineTone;
  status: InvoiceStatus;
  number: string;
  total: string;
};

export type TimelinePoint = AppointmentTimelinePoint | RecordTimelinePoint | InvoiceTimelinePoint;
