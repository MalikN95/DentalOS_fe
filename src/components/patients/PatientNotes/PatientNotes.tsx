'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { MessageIcon, PlusIcon } from '@/components/icons/icons';
import { Alert } from '@/components/ui';
import { formatDate, formatTime } from '@/helpers/date';
import { usePatientNotes } from '@/hooks/usePatientNotes';
import styles from './PatientNotes.module.css';

type PatientNotesProps = {
  patientId: string;
  className?: string;
  style?: React.CSSProperties;
};

export const PatientNotes = ({ patientId, className, style }: PatientNotesProps) => {
  const { t: dict } = useTranslation();
  const t = dict.patientNotes;
  const { notes, isLoading, errorMessage, mutation } = usePatientNotes(patientId);
  const [text, setText] = useState('');

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;

    mutation.mutate(trimmed, { onSuccess: () => setText('') });
  };

  return (
    <section className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      <div className={styles.header}>
        <span className={styles.headerIcon}>
          <MessageIcon size={13} />
        </span>
        <h2 className={styles.heading}>{t.title}</h2>
      </div>

      <form className={styles.composer} onSubmit={handleSubmit}>
        <textarea
          className={styles.textarea}
          placeholder={t.placeholder}
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button
          type="submit"
          className={styles.submit}
          aria-label={mutation.isPending ? t.adding : t.add}
          title={mutation.isPending ? t.adding : t.add}
          disabled={mutation.isPending || !text.trim()}
        >
          <PlusIcon size={16} />
        </button>
      </form>

      {errorMessage ? <Alert color="danger">{errorMessage}</Alert> : null}
      {mutation.error ? <Alert color="danger">{mutation.error.message}</Alert> : null}

      <div className={styles.list}>
        {isLoading ? <span className={styles.state}>{dict.common.loading}</span> : null}
        {!isLoading && notes.length === 0 ? <span className={styles.empty}>{t.empty}</span> : null}
        {notes.map((note) => {
          const authorName = `${note.author.firstName} ${note.author.lastName}`.trim();
          const authorRole = dict.roles[note.author.role] ?? note.author.role;

          return (
            <article key={note.id} className={styles.note}>
              <p className={styles.noteText}>{note.text}</p>
              <div className={styles.noteMeta}>
                <span className={styles.noteAuthor}>{authorName}</span>
                <span className={styles.noteRole}>{authorRole}</span>
                <span className={styles.noteDate}>
                  {formatDate(note.createdAt)}, {formatTime(note.createdAt)}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};
