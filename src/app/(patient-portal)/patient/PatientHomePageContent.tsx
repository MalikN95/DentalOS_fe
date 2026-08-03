'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { CalendarIcon, MessageIcon } from '@/components/icons/icons';
import { AccordionSection } from '@/components/patient-portal/AccordionSection/AccordionSection';
import { AppointmentCard } from '@/components/patient-portal/AppointmentCard/AppointmentCard';
import { MessageBubble } from '@/components/patient-portal/MessageBubble/MessageBubble';
import { EmptyState } from '@/components/ui';
import { usePortalAppointments } from '@/hooks/usePortalAppointments';
import { usePortalMessages } from '@/hooks/usePortalMessages';
import { usePortalProfile } from '@/hooks/usePortalProfile';
import styles from './PatientHomePageContent.module.css';

const PREVIEW_COUNT = 3;

export const PatientHomePageContent = () => {
  const { t } = useTranslation();
  const { profile } = usePortalProfile();
  const { appointments } = usePortalAppointments('upcoming');
  const { messages } = usePortalMessages();

  const [isAppointmentsOpen, setIsAppointmentsOpen] = useState(true);
  const [isMessagesOpen, setIsMessagesOpen] = useState(false);

  const nextAppointment = appointments[0] ?? null;
  const previewAppointments = appointments.slice(0, PREVIEW_COUNT);
  const previewMessages = messages.slice(-PREVIEW_COUNT);

  return (
    <div className={styles.page}>
      <h1 className={styles.greeting}>
        {t.patientPortal.hello}
        {profile ? `, ${profile.firstName}` : ''}
      </h1>

      <section>
        <h2 className={styles.sectionTitle}>{t.patientPortal.upcomingSectionTitle}</h2>
        {nextAppointment ? (
          <AppointmentCard appointment={nextAppointment} />
        ) : (
          <EmptyState title={t.patientPortal.noUpcoming} />
        )}
      </section>

      <AccordionSection
        icon={<CalendarIcon size={18} />}
        title={t.patientPortal.appointmentsCardTitle}
        count={appointments.length}
        isOpen={isAppointmentsOpen}
        onToggle={() => setIsAppointmentsOpen((open) => !open)}
      >
        <div className={styles.previewList}>
          {previewAppointments.length > 0 ? (
            previewAppointments.map((appointment) => (
              <AppointmentCard key={appointment.id} appointment={appointment} />
            ))
          ) : (
            <EmptyState title={t.patientPortal.noUpcoming} />
          )}
          <Link href="/patient/appointments" className={styles.viewAllLink}>
            {t.patientPortal.viewAll}
          </Link>
        </div>
      </AccordionSection>

      <AccordionSection
        icon={<MessageIcon size={18} />}
        title={t.patientPortal.messagesCardTitle}
        count={messages.length}
        isOpen={isMessagesOpen}
        onToggle={() => setIsMessagesOpen((open) => !open)}
      >
        <div className={styles.previewList}>
          {previewMessages.length > 0 ? (
            previewMessages.map((message) => <MessageBubble key={message.id} message={message} />)
          ) : (
            <EmptyState title={t.patientPortal.messagesEmpty} />
          )}
          <Link href="/patient/messages" className={styles.viewAllLink}>
            {t.patientPortal.viewAll}
          </Link>
        </div>
      </AccordionSection>
    </div>
  );
};
