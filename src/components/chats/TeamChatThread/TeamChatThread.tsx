'use client';

import { useEffect, useRef, useState } from 'react';
import type { ApiChatMessage } from '@/common/types/chat';
import { Button } from '@/components/ui';
import { formatDate, formatTime, isSameDay } from '@/helpers/date';
import styles from './TeamChatThread.module.css';

type TeamChatThreadProps = {
  title: string;
  messages: ApiChatMessage[];
  currentUserId: string;
  isLoading: boolean;
  errorMessage: string | null;
  emptyLabel: string;
  placeholder: string;
  sendLabel: string;
  isSending: boolean;
  onSend: (body: string) => void;
};

const formatMessageTime = (isoDate: string): string =>
  isSameDay(new Date(isoDate), new Date()) ? formatTime(isoDate) : formatDate(isoDate);

export const TeamChatThread = ({
  title,
  messages,
  currentUserId,
  isLoading,
  errorMessage,
  emptyLabel,
  placeholder,
  sendLabel,
  isSending,
  onSend,
}: TeamChatThreadProps) => {
  const [draft, setDraft] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: 'end' });
  }, [messages.length]);

  const submit = () => {
    const body = draft.trim();
    if (!body) return;
    onSend(body);
    setDraft('');
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      submit();
    }
  };

  return (
    <div className={styles.thread}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
      </div>

      <div className={styles.messages}>
        {errorMessage ? <span className={styles.error}>{errorMessage}</span> : null}

        {!isLoading && messages.length === 0 && !errorMessage ? (
          <span className={styles.empty}>{emptyLabel}</span>
        ) : null}

        {messages.map((message) => {
          const isOwn = message.author.id === currentUserId;

          return (
            <div key={message.id} className={`${styles.row} ${isOwn ? styles.rowOwn : ''}`}>
              <div className={`${styles.bubble} ${isOwn ? styles.bubbleOwn : ''}`}>
                {!isOwn ? (
                  <span className={styles.author}>
                    {message.author.firstName} {message.author.lastName}
                  </span>
                ) : null}
                <span className={styles.body}>{message.body}</span>
                <span className={styles.time}>{formatMessageTime(message.createdAt)}</span>
              </div>
            </div>
          );
        })}

        <div ref={bottomRef} />
      </div>

      <div className={styles.composer}>
        <textarea
          className={styles.textarea}
          rows={1}
          placeholder={placeholder}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={handleKeyDown}
        />
        <Button onClick={submit} disabled={isSending || draft.trim().length === 0}>
          {sendLabel}
        </Button>
      </div>
    </div>
  );
};
