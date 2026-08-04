'use client';

import { useTranslation, format } from '@/common/locale/LocaleProvider';
import { Badge, NotificationBadge, PatientAvatar } from '@/components/ui';
import { CheckIcon, StarIcon } from '@/components/icons/icons';
import { appointmentStatusColor, formatMoney } from '@/helpers/appointment-status';
import { invoiceStatusColor } from '@/helpers/invoice-status';
import type { AppointmentStatus } from '@/common/types/appointment';
import type { InvoiceStatus } from '@/common/types/finance';
import type { TreatmentPlanItemStatus } from '@/common/types/treatment-plan';
import styles from './Mockups.module.css';

type WindowFrameProps = {
  title: string;
  children: React.ReactNode;
};

const WindowFrame = ({ title, children }: WindowFrameProps) => (
  <div className={styles.window}>
    <div className={styles.windowBar}>
      <span className={styles.dots}>
        <span className={styles.dot} />
        <span className={styles.dot} />
        <span className={styles.dot} />
      </span>
      <span className={styles.windowTitle}>{title}</span>
    </div>
    <div className={styles.windowBody}>{children}</div>
  </div>
);

const BOARD_ROWS: {
  time: string;
  patient: string;
  doctor: string;
  status: AppointmentStatus;
}[] = [
  { time: '09:00–09:40', patient: 'Иванов Иван', doctor: 'Смирнова А.', status: 'confirmed' },
  { time: '10:00–10:45', patient: 'Смирнов Пётр', doctor: 'Ким Р.', status: 'arrived' },
  { time: '11:00–12:00', patient: 'Петрова Анна', doctor: 'Смирнова А.', status: 'in_treatment' },
  { time: '13:30–14:00', patient: 'Козлов Максим', doctor: 'Ким Р.', status: 'completed' },
  { time: '15:00–15:30', patient: 'Орлова Дарья', doctor: 'Смирнова А.', status: 'cancelled' },
];

export const BoardMockup = () => {
  const { t } = useTranslation();

  return (
    <WindowFrame title={t.appointments.todayTitle}>
      <div className={styles.list}>
        {BOARD_ROWS.map((row) => (
          <div key={row.time} className={styles.row}>
            <PatientAvatar name={row.patient} size="sm" />
            <div className={styles.rowMain}>
              <span className={styles.rowName}>{row.patient}</span>
              <span className={styles.rowMeta}>
                {row.time} · {row.doctor}
              </span>
            </div>
            <Badge color={appointmentStatusColor[row.status]}>
              {t.appointmentStatus[row.status]}
            </Badge>
          </div>
        ))}
      </div>
    </WindowFrame>
  );
};

const TEETH: { n: number; condition: 'healthy' | 'caries' | 'filling' | 'crown' }[] = [
  { n: 16, condition: 'healthy' },
  { n: 15, condition: 'healthy' },
  { n: 14, condition: 'caries' },
  { n: 13, condition: 'healthy' },
  { n: 12, condition: 'healthy' },
  { n: 36, condition: 'filling' },
  { n: 37, condition: 'healthy' },
  { n: 46, condition: 'crown' },
];

const PLAN_ITEMS: { label: string; price: number; status: TreatmentPlanItemStatus }[] = [
  { label: 'Пломба, зуб 36', price: 4500, status: 'done' },
  { label: 'Профессиональная чистка', price: 3000, status: 'done' },
  { label: 'Коронка, зуб 46', price: 18000, status: 'planned' },
];

export const ChartMockup = () => {
  const { t } = useTranslation();
  const doneCount = PLAN_ITEMS.filter((item) => item.status === 'done').length;

  return (
    <WindowFrame title="Иванов Иван · 34">
      <div className={styles.teethRow}>
        {TEETH.map((tooth) => (
          <span
            key={tooth.n}
            className={`${styles.tooth} ${styles[tooth.condition] ?? ''}`}
            title={t.dentalChart.condition[tooth.condition]}
          >
            {tooth.n}
          </span>
        ))}
      </div>
      <div className={styles.list}>
        {PLAN_ITEMS.map((item) => (
          <div key={item.label} className={styles.planRow}>
            <span
              className={`${styles.planCheck} ${item.status === 'done' ? styles.planCheckDone : ''}`}
            >
              {item.status === 'done' ? <CheckIcon size={11} /> : null}
            </span>
            <span className={styles.rowName}>{item.label}</span>
            <span className={styles.planPrice}>{formatMoney(String(item.price))}</span>
          </div>
        ))}
      </div>
      <div className={styles.progressRow}>
        <div className={styles.progressTrack}>
          <div
            className={styles.progressFill}
            style={{ width: `${Math.round((doneCount / PLAN_ITEMS.length) * 100)}%` }}
          />
        </div>
        <span className={styles.rowMeta}>
          {format(t.treatmentPlans.progressLabel, { done: doneCount, total: PLAN_ITEMS.length })}
        </span>
      </div>
    </WindowFrame>
  );
};

const TIME_SLOTS = ['09:00', '09:40', '11:20', '14:00'];

export const BookingMockup = () => {
  const { t } = useTranslation();

  return (
    <WindowFrame title="dentalos.ru/book/maximum">
      <div className={styles.stepsRow}>
        <span className={`${styles.stepChip} ${styles.stepDone}`}>
          <CheckIcon size={11} /> {t.booking.branchTitle}
        </span>
        <span className={`${styles.stepChip} ${styles.stepDone}`}>
          <CheckIcon size={11} /> {t.booking.serviceTitle}
        </span>
        <span className={`${styles.stepChip} ${styles.stepActive}`}>{t.booking.doctorTitle}</span>
      </div>
      <div className={styles.doctorCard}>
        <PatientAvatar name="Смирнова Анна" size="md" />
        <div className={styles.rowMain}>
          <span className={styles.rowName}>Смирнова Анна</span>
          <span className={styles.rowMeta}>{format(t.booking.doctorExperience, { years: 8 })}</span>
        </div>
        <span className={styles.rating}>
          <StarIcon size={13} filled />{' '}
          {format(t.booking.doctorRating, { rating: '4.9', count: 126 })}
        </span>
      </div>
      <div className={styles.chipsRow}>
        {TIME_SLOTS.map((slot, index) => (
          <span key={slot} className={`${styles.slotChip} ${index === 1 ? styles.slotActive : ''}`}>
            {slot}
          </span>
        ))}
      </div>
      <div className={styles.successBar}>
        <CheckIcon size={14} />
        {t.booking.confirmationTitle}
      </div>
    </WindowFrame>
  );
};

const INVOICE_ROWS: { patient: string; total: string; status: InvoiceStatus }[] = [
  { patient: 'Иванов Иван', total: '4 500 ₽', status: 'paid' },
  { patient: 'Смирнов Пётр', total: '18 000 ₽', status: 'partially_paid' },
  { patient: 'Петрова Анна', total: '3 000 ₽', status: 'pending' },
];

export const FinanceMockup = () => {
  const { t } = useTranslation();

  return (
    <WindowFrame title={t.finance.invoicesTitle}>
      <div className={styles.statsRow}>
        <div className={styles.stat}>
          <span className={styles.statValue}>284 500 ₽</span>
          <span className={styles.statLabel}>{t.finance.statPaid}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>12 000 ₽</span>
          <span className={styles.statLabel}>{t.finance.statRefunded}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statValue}>272 500 ₽</span>
          <span className={styles.statLabel}>{t.finance.statNet}</span>
        </div>
      </div>
      <div className={styles.list}>
        {INVOICE_ROWS.map((row) => (
          <div key={row.patient} className={styles.row}>
            <span className={styles.rowName}>{row.patient}</span>
            <span className={styles.rowMeta}>{row.total}</span>
            <Badge color={invoiceStatusColor[row.status]}>{t.finance.status[row.status]}</Badge>
          </div>
        ))}
      </div>
      <div className={styles.chipsRow}>
        <span className={styles.chip}>{t.paymentMethods.cash} · 62%</span>
        <span className={styles.chip}>{t.paymentMethods.card} · 31%</span>
        <span className={styles.chip}>{t.paymentMethods.transfer} · 7%</span>
      </div>
    </WindowFrame>
  );
};

export const ReviewsMockup = () => {
  const { t } = useTranslation();

  return (
    <WindowFrame title={t.reviews.title}>
      <div className={styles.reviewRow}>
        <PatientAvatar name="Смирнова Анна" size="sm" />
        <div className={styles.rowMain}>
          <span className={styles.rowName}>Смирнова Анна · {t.staffDetail.branch}: Максимум</span>
          <span className={styles.rowMeta}>«Очень внимательный врач, всё аккуратно объяснила»</span>
        </div>
        <span className={styles.rating}>
          <StarIcon size={13} filled />
          <StarIcon size={13} filled />
          <StarIcon size={13} filled />
          <StarIcon size={13} filled />
          <StarIcon size={13} filled />
        </span>
      </div>
      <div className={styles.chatThread}>
        <div className={styles.chatBubbleIn}>Здравствуйте! Можно перенести приём на пятницу?</div>
        <div className={styles.chatBubbleOut}>Да, конечно — записали вас на пятницу, 11:00</div>
      </div>
      <div className={styles.row}>
        <span className={styles.rowMeta}>{t.patientPortal.messagesCardTitle}</span>
        <NotificationBadge count={2} />
      </div>
    </WindowFrame>
  );
};
