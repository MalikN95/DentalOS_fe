'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { NotificationBadge } from '@/components/ui';
import { BellIcon } from '@/components/icons/icons';
import { useNotifications } from '@/hooks/useNotifications';
import { usePushNotifications } from '@/hooks/usePushNotifications';
import { useToast } from '@/components/providers/ToastProvider';
import styles from './NotificationBell.module.css';

const formatTime = (iso: string): string =>
  new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export const NotificationBell = () => {
  const { t } = useTranslation();
  const { showToast } = useToast();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleForegroundPush = useCallback(
    (message: { title: string; body: string }) => {
      showToast(`${message.title}: ${message.body}`);
    },
    [showToast],
  );

  const { status: pushStatus, enablePush } = usePushNotifications(handleForegroundPush);

  useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const handleEnablePush = () => {
    enablePush().catch(() => undefined);
  };

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsRead(id);
    }
  };

  return (
    <div className={styles.wrapper} ref={panelRef}>
      <button
        type="button"
        className={styles.bell}
        aria-label={t.header.notifications}
        title={t.header.notifications}
        onClick={toggleOpen}
      >
        <BellIcon size={18} />
        {unreadCount > 0 ? (
          <NotificationBadge className={styles.bellBadge} count={unreadCount} />
        ) : null}
      </button>

      {isOpen ? (
        <div className={styles.panel}>
          <div className={styles.panelHeader}>
            <span className={styles.panelTitle}>{t.header.notifications}</span>
            {unreadCount > 0 ? (
              <button type="button" className={styles.markAllButton} onClick={() => markAllAsRead()}>
                {t.header.markAllRead}
              </button>
            ) : null}
          </div>

          {pushStatus === 'default' ? (
            <button type="button" className={styles.pushPrompt} onClick={handleEnablePush}>
              {t.header.enablePush}
            </button>
          ) : null}

          <div className={styles.list}>
            {notifications.length === 0 ? (
              <p className={styles.empty}>{t.header.noNotifications}</p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  className={`${styles.item} ${notification.isRead ? '' : styles.itemUnread}`}
                  onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                >
                  <span className={styles.itemTitle}>{notification.title}</span>
                  <span className={styles.itemBody}>{notification.body}</span>
                  <span className={styles.itemTime}>{formatTime(notification.createdAt)}</span>
                </button>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
};
