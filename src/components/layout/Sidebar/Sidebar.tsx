import Link from 'next/link';
import { NotificationBadge } from '@/components/ui';
import { LogoutIcon, ToothIcon } from '@/components/icons/icons';
import styles from './Sidebar.module.css';

export type SidebarItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badgeCount?: number;
};

type SidebarProps = {
  items: SidebarItem[];
  activeId: string;
  clinicName: string;
  className?: string;
  style?: React.CSSProperties;
  onLogout?: () => void;
};

export const Sidebar = ({
  items,
  activeId,
  clinicName,
  className,
  style,
  onLogout,
}: SidebarProps) => (
  <aside className={`${styles.sidebar} ${className ?? ''}`} style={style}>
    <div className={styles.logo}>
      <span className={styles.logoMark}>
        <ToothIcon size={20} />
      </span>
      {clinicName}
    </div>

    <nav className={styles.nav}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`${styles.item} ${item.id === activeId ? styles.itemActive : ''}`}
        >
          {item.icon}
          <span className={styles.itemLabel}>{item.label}</span>
          {item.badgeCount ? <NotificationBadge count={item.badgeCount} /> : null}
        </Link>
      ))}
    </nav>

    <div className={styles.footer}>
      <button type="button" className={styles.item} onClick={onLogout}>
        <LogoutIcon />
        <span className={styles.itemLabel}>Выйти</span>
      </button>
    </div>
  </aside>
);
