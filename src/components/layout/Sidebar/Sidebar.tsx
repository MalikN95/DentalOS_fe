import Link from 'next/link';
import { NotificationBadge } from '@/components/ui';
import { CloseIcon, LogoutIcon, Logo, PanelLeftIcon } from '@/components/icons/icons';
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
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  closeMenuLabel: string;
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
  isMobileOpen,
  onCloseMobile,
  closeMenuLabel,
  className,
  style,
  onLogout,
}: SidebarProps) => (
  <>
    <div
      className={`${styles.overlay} ${isMobileOpen ? styles.overlayVisible : ''}`}
      onClick={onCloseMobile}
      aria-hidden="true"
    />
    <aside
      className={`${styles.sidebar} ${isCollapsed ? styles.sidebarCollapsed : ''} ${isMobileOpen ? styles.sidebarOpen : ''} ${className ?? ''}`}
      style={style}
    >
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
        <button
          type="button"
          className={styles.mobileClose}
          onClick={onCloseMobile}
          aria-label={closeMenuLabel}
          title={closeMenuLabel}
        >
          <CloseIcon size={18} />
        </button>
      </div>

      <button
        type="button"
        className={`${styles.item} ${styles.collapseToggle}`}
        onClick={onToggleCollapse}
        aria-label={isCollapsed ? expandLabel : collapseLabel}
        title={isCollapsed ? expandLabel : collapseLabel}
      >
        <PanelLeftIcon size={18} />
        {isCollapsed ? null : <span className={styles.itemLabel}>{collapseLabel}</span>}
      </button>

      <nav className={styles.nav}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`${styles.item} ${item.id === activeId ? styles.itemActive : ''}`}
            title={isCollapsed ? item.label : undefined}
            onClick={onCloseMobile}
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
  </>
);
