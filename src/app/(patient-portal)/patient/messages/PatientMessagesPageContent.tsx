'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { MessageBubble } from '@/components/patient-portal/MessageBubble/MessageBubble';
import { MessageComposer } from '@/components/patient-portal/MessageComposer/MessageComposer';
import { EmptyState } from '@/components/ui';
import { usePortalMessages } from '@/hooks/usePortalMessages';
import { usePortalSendMessage } from '@/hooks/usePortalSendMessage';
import styles from './PatientMessagesPageContent.module.css';

export const PatientMessagesPageContent = () => {
  const { t } = useTranslation();
  const { messages, isLoading } = usePortalMessages();
  const sendMessage = usePortalSendMessage();
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const handleSend = () => {
    const body = draft.trim();
    if (!body || sendMessage.isPending) return;

    sendMessage.mutate(body, { onSuccess: () => setDraft('') });
  };

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t.patientPortal.messagesTitle}</h1>

      <div className={styles.thread}>
        {!isLoading && messages.length === 0 ? (
          <EmptyState title={t.patientPortal.messagesEmpty} />
        ) : (
          messages.map((message) => <MessageBubble key={message.id} message={message} />)
        )}
        <div ref={bottomRef} />
      </div>

      <MessageComposer
        value={draft}
        isSending={sendMessage.isPending}
        onChange={setDraft}
        onSend={handleSend}
      />
    </div>
  );
};
