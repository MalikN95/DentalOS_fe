'use client';

import type { ApiConversationSummary, ChatSelection } from '@/common/types/chat';
import { MailIcon, MessageIcon, PhoneIcon } from '@/components/icons/icons';
import { PatientAvatar } from '@/components/ui';
import { formatDate, formatTime, isSameDay } from '@/helpers/date';
import styles from './ChatSidebar.module.css';

type ChatSidebarProps = {
  selection: ChatSelection;
  onSelect: (selection: ChatSelection) => void;
  teamChatLabel: string;
  teamChatPreview: string;
  patientsHeading: string;
  conversations: ApiConversationSummary[];
  hasMoreConversations: boolean;
  onLoadMoreConversations: () => void;
  loadMoreLabel: string;
  emptyConversationsLabel: string;
};

const formatConversationTime = (isoDate: string): string =>
  isSameDay(new Date(isoDate), new Date()) ? formatTime(isoDate) : formatDate(isoDate);

export const ChatSidebar = ({
  selection,
  onSelect,
  teamChatLabel,
  teamChatPreview,
  patientsHeading,
  conversations,
  hasMoreConversations,
  onLoadMoreConversations,
  loadMoreLabel,
  emptyConversationsLabel,
}: ChatSidebarProps) => (
  <aside className={styles.sidebar}>
    <button
      type="button"
      className={`${styles.row} ${selection.type === 'team' ? styles.rowActive : ''}`}
      onClick={() => onSelect({ type: 'team' })}
    >
      <span className={styles.teamIcon}>
        <MessageIcon size={18} />
      </span>
      <span className={styles.rowBody}>
        <span className={styles.rowTop}>
          <span className={styles.name}>{teamChatLabel}</span>
        </span>
        <span className={styles.preview}>{teamChatPreview}</span>
      </span>
    </button>

    <span className={styles.sectionHeading}>{patientsHeading}</span>

    {conversations.length === 0 ? (
      <span className={styles.empty}>{emptyConversationsLabel}</span>
    ) : (
      conversations.map((conversation) => {
        const isActive =
          selection.type === 'patient' && selection.patientId === conversation.patientId;

        return (
          <button
            key={conversation.patientId}
            type="button"
            className={`${styles.row} ${isActive ? styles.rowActive : ''}`}
            onClick={() => onSelect({ type: 'patient', patientId: conversation.patientId })}
          >
            <PatientAvatar size="sm" name={conversation.patientName} />
            <span className={styles.rowBody}>
              <span className={styles.rowTop}>
                <span className={styles.name}>{conversation.patientName}</span>
                <span className={styles.time}>
                  {formatConversationTime(conversation.lastMessageAt)}
                </span>
              </span>
              <span className={styles.preview}>
                {conversation.lastMessageChannel === 'email' ? (
                  <MailIcon size={12} className={styles.previewIcon} />
                ) : (
                  <PhoneIcon size={12} className={styles.previewIcon} />
                )}
                <span className={styles.previewText}>{conversation.lastMessagePreview}</span>
              </span>
            </span>
          </button>
        );
      })
    )}

    {hasMoreConversations ? (
      <button type="button" className={styles.loadMore} onClick={onLoadMoreConversations}>
        {loadMoreLabel}
      </button>
    ) : null}
  </aside>
);
