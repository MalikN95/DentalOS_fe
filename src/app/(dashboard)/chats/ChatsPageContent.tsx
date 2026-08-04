'use client';

import { useState } from 'react';
import type { ChatSelection } from '@/common/types/chat';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { ChatSidebar } from '@/components/chats/ChatSidebar/ChatSidebar';
import { PatientMessageThread } from '@/components/chats/PatientMessageThread/PatientMessageThread';
import { TeamChatThread } from '@/components/chats/TeamChatThread/TeamChatThread';
import { usePatientConversations } from '@/hooks/usePatientConversations';
import { usePatientMessages } from '@/hooks/usePatientMessages';
import { useSendTeamChatMessage } from '@/hooks/useSendTeamChatMessage';
import { useTeamChatMessages } from '@/hooks/useTeamChatMessages';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './ChatsPageContent.module.css';

export const ChatsPageContent = () => {
  const { t: dict } = useTranslation();
  const t = dict.chats;
  const currentUser = useAppSelector(selectCurrentUser);
  const [selection, setSelection] = useState<ChatSelection>({ type: 'team' });
  // Only meaningful on mobile, where the sidebar and the thread share one pane.
  const [isThreadOpenOnMobile, setIsThreadOpenOnMobile] = useState(false);

  const handleSelect = (next: ChatSelection) => {
    setSelection(next);
    setIsThreadOpenOnMobile(true);
  };

  const handleBack = () => setIsThreadOpenOnMobile(false);

  const { messages: teamMessages, isLoading: isTeamLoading, errorMessage: teamError } =
    useTeamChatMessages();
  const sendTeamMessage = useSendTeamChatMessage();

  const { conversations, hasMore, isLoading: isConversationsLoading, loadMore } =
    usePatientConversations();

  const selectedPatientId = selection.type === 'patient' ? selection.patientId : null;
  const { messages: patientMessages, isLoading: isPatientLoading, errorMessage: patientError } =
    usePatientMessages(selectedPatientId);

  const selectedConversation = conversations.find(
    (conversation) => conversation.patientId === selectedPatientId,
  );

  const teamChatPreview = teamMessages.length > 0
    ? teamMessages[teamMessages.length - 1].body
    : t.teamChatEmptyPreview;

  return (
    <div className={styles.page}>
      <ChatSidebar
        className={isThreadOpenOnMobile ? styles.hiddenOnMobile : undefined}
        selection={selection}
        onSelect={handleSelect}
        teamChatLabel={t.teamChatName}
        teamChatPreview={teamChatPreview}
        patientsHeading={t.patientsHeading}
        conversations={conversations}
        hasMoreConversations={!isConversationsLoading && hasMore}
        onLoadMoreConversations={loadMore}
        loadMoreLabel={t.loadMore}
        emptyConversationsLabel={t.noConversations}
      />

      {selection.type === 'team' ? (
        <TeamChatThread
          className={isThreadOpenOnMobile ? undefined : styles.hiddenOnMobile}
          title={t.teamChatName}
          messages={teamMessages}
          currentUserId={currentUser?.id ?? ''}
          isLoading={isTeamLoading}
          errorMessage={teamError}
          emptyLabel={t.teamEmpty}
          placeholder={t.teamComposerPlaceholder}
          sendLabel={t.send}
          isSending={sendTeamMessage.isPending}
          onSend={(body) => sendTeamMessage.mutate(body)}
          onBack={handleBack}
          backLabel={t.back}
        />
      ) : (
        <PatientMessageThread
          className={isThreadOpenOnMobile ? undefined : styles.hiddenOnMobile}
          patientName={selectedConversation?.patientName ?? ''}
          messages={patientMessages}
          isLoading={isPatientLoading}
          errorMessage={patientError}
          emptyLabel={t.patientMessagesEmpty}
          sentByTemplate={t.sentBy}
          automaticLabel={t.automatic}
          onBack={handleBack}
          backLabel={t.back}
        />
      )}
    </div>
  );
};
