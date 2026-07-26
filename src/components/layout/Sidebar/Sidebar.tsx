import Link from 'next/link';
import { NotificationBadge } from '@/components/ui';
import { ChevronLeftIcon, LogoutIcon, Logo } from '@/components/icons/icons';
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
  logoUrl?: string | null;
  logoutLabel: string;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  collapseLabel: string;
  expandLabel: string;
  className?: string;
  style?: React.CSSProperties;
  onLogout?: () => void;
};

export const Sidebar = ({
  items,
  activeId,
  clinicName,
  logoUrl,
  logoutLabel,
  isCollapsed,
  onToggleCollapse,
  collapseLabel,
  expandLabel,
  className,
  style,
  onLogout,
}: SidebarProps) => (
  <aside
    className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''} ${className ?? ''}`}
    style={style}
  >
    <button
      type="button"
      className={styles.collapseToggle}
      onClick={onToggleCollapse}
      aria-label={isCollapsed ? expandLabel : collapseLabel}
      title={isCollapsed ? expandLabel : collapseLabel}
    >
      <ChevronLeftIcon size={14} className={isCollapsed ? styles.collapseIconFlipped : undefined} />
    </button>

    <div className={styles.logo}>
      <span className={styles.logoMark}>
        {logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, arbitrary aspect ratio
          <img src={logoUrl} alt="" className={styles.logoImage} />
        ) : (
          <Logo height={22} />
        )}
      </span>
      {isCollapsed ? null : clinicName}
    </div>

    <nav className={styles.nav}>
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`${styles.item} ${item.id === activeId ? styles.itemActive : ''}`}
          title={isCollapsed ? item.label : undefined}
        >
          {item.icon}
          {isCollapsed ? null : <span className={styles.itemLabel}>{item.label}</span>}
          {!isCollapsed && item.badgeCount ? <NotificationBadge count={item.badgeCount} /> : null}
        </Link>
      ))}
    </nav>

    <div className={styles.footer}>
      <button
        type="button"
        className={styles.item}
        onClick={onLogout}
        title={isCollapsed ? logoutLabel : undefined}
      >
        <LogoutIcon />
        {isCollapsed ? null : <span className={styles.itemLabel}>{logoutLabel}</span>}
      </button>
    </div>
  </aside>
);
