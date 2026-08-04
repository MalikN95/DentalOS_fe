'use client';

import Link from 'next/link';
import { LogoutIcon, ShieldIcon } from '@/components/icons/icons';
import { getInitials } from '@/helpers/initials';
import styles from './SuperAdminTopNav.module.css';

export type SuperAdminNavItem = {
  id: string;
  label: string;
  href: string;
};

type SuperAdminTopNavProps = {
  items: SuperAdminNavItem[];
  activeId: string;
  title: string;
  userName: string;
  userRole: string;
  logoutLabel: string;
  onLogout?: () => void;
  className?: string;
  style?: React.CSSProperties;
};

export const SuperAdminTopNav = ({
  items,
  activeId,
  title,
  userName,
  userRole,
  logoutLabel,
  onLogout,
  className,
  style,
}: SuperAdminTopNavProps) => (
  <header className={`${styles.bar} ${className ?? ''}`} style={style}>
    <div className={styles.leftGroup}>
      <span className={styles.logo}>
        <ShieldIcon size={18} />
        <span className={styles.title}>{title}</span>
      </span>

      <nav className={styles.nav}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`${styles.navItem} ${item.id === activeId ? styles.navItemActive : ''}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </div>

    <div className={styles.rightGroup}>
      <div className={styles.user}>
        <span className={styles.avatar}>{getInitials(userName)}</span>
        <span className={styles.userInfo}>
          <span className={styles.userName}>{userName}</span>
          <span className={styles.userRole}>{userRole}</span>
        </span>
      </div>

      <button
        type="button"
        className={styles.logout}
        aria-label={logoutLabel}
        title={logoutLabel}
        onClick={onLogout}
      >
        <LogoutIcon size={18} />
      </button>
    </div>
  </header>
);
