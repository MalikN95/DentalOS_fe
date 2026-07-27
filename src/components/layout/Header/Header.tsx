import { NotificationBadge } from '@/components/ui';
import { BellIcon, MenuIcon } from '@/components/icons/icons';
import styles from './Header.module.css';

type HeaderProps = {
  title: string;
  userName: string;
  userRole: string;
  notificationsLabel: string;
  notificationsCount?: number;
  menuLabel: string;
  onMenuClick: () => void;
  className?: string;
  style?: React.CSSProperties;
  onNotificationsClick?: () => void;
};

const getInitials = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const Header = ({
  title,
  userName,
  userRole,
  notificationsLabel,
  notificationsCount = 0,
  menuLabel,
  onMenuClick,
  className,
  style,
  onNotificationsClick,
}: HeaderProps) => (
  <header className={`${styles.header} ${className ?? ''}`} style={style}>
    <div className={styles.titleRow}>
      <button
        type="button"
        className={styles.menuButton}
        aria-label={menuLabel}
        onClick={onMenuClick}
      >
        <MenuIcon size={20} />
      </button>
      <h1 className={styles.title}>{title}</h1>
    </div>

    <div className={styles.actions}>
      <button
        type="button"
        className={styles.bell}
        aria-label={notificationsLabel}
        onClick={onNotificationsClick}
      >
        <BellIcon />
        {notificationsCount > 0 ? (
          <NotificationBadge className={styles.bellBadge} count={notificationsCount} />
        ) : null}
      </button>

      <div className={styles.user}>
        <span className={styles.avatar}>{getInitials(userName)}</span>
        <span className={styles.userInfo}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.userRole}>{userRole}</span>
        </span>
      </div>
    </div>
  </header>
);
