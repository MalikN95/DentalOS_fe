'use client';

import Link from 'next/link';
import { NotificationBadge } from '@/components/ui';
import {
  CloseIcon,
  Logo,
  LogoutIcon,
  MenuIcon,
  SearchIcon,
  UserPlusIcon,
} from '@/components/icons/icons';
import { NotificationBell } from '@/components/layout/NotificationBell/NotificationBell';
import { getInitials } from '@/helpers/initials';
import styles from './TopNav.module.css';

export type TopNavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
  badgeCount?: number;
};

type TopNavProps = {
  items: TopNavItem[];
  activeId: string;
  clinicName: string;
  logoUrl?: string | null;
  newPatientHref: string;
  newPatientLabel: string;
  searchPlaceholder: string;
  onSearchSubmit: (value: string) => void;
  userName: string;
  userRole: string;
  logoutLabel: string;
  onLogout: () => void;
  isMobileOpen: boolean;
  onToggleMobile: () => void;
  onCloseMobile: () => void;
  openMenuLabel: string;
  closeMenuLabel: string;
  className?: string;
  style?: React.CSSProperties;
};

export const TopNav = ({
  items,
  activeId,
  clinicName,
  logoUrl,
  newPatientHref,
  newPatientLabel,
  searchPlaceholder,
  onSearchSubmit,
  userName,
  userRole,
  logoutLabel,
  onLogout,
  isMobileOpen,
  onToggleMobile,
  onCloseMobile,
  openMenuLabel,
  closeMenuLabel,
  className,
  style,
}: TopNavProps) => {
  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Enter') return;
    const value = event.currentTarget.value.trim();
    if (value) onSearchSubmit(value);
  };

  const navLinks = (onNavigate?: () => void) => (
    <>
      {items.map((item) => (
        <Link
          key={item.id}
          href={item.href}
          className={`${styles.navItem} ${item.id === activeId ? styles.navItemActive : ''}`}
          title={item.label}
          onClick={onNavigate}
        >
          <span className={styles.navIcon}>
            {item.icon}
            {item.badgeCount ? <NotificationBadge className={styles.navBadge} count={item.badgeCount} /> : null}
          </span>
          <span className={styles.navLabel}>{item.label}</span>
        </Link>
      ))}
      <Link
        href={newPatientHref}
        className={`${styles.navItem} ${styles.navItemCta}`}
        title={newPatientLabel}
        onClick={onNavigate}
      >
        <span className={styles.navIcon}>
          <UserPlusIcon size={19} />
        </span>
        <span className={styles.navLabel}>{newPatientLabel}</span>
      </Link>
    </>
  );

  return (
    <>
      <header className={`${styles.bar} ${className ?? ''}`} style={style}>
        <div className={styles.leftGroup}>
          <Link href="/dashboard" className={styles.logo}>
            <span className={styles.logoMark}>
              {logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, arbitrary aspect ratio
                <img src={logoUrl} alt="" className={styles.logoImage} />
              ) : (
                <Logo height={20} />
              )}
            </span>
            <span className={styles.clinicName}>{clinicName}</span>
          </Link>

          <div className={styles.search}>
            <SearchIcon size={16} className={styles.searchIcon} />
            <input
              type="search"
              className={styles.searchInput}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              onKeyDown={handleSearchKeyDown}
            />
          </div>
        </div>

        <nav className={styles.nav}>{navLinks()}</nav>

        <div className={styles.rightGroup}>
          <div className={styles.profileGroup}>
            <NotificationBell />

            <div className={styles.user}>
              <span className={styles.avatar}>{getInitials(userName)}</span>
              <span className={styles.userInfo}>
                <span className={styles.userName}>{userName}</span>
                <span className={styles.userRole}>{userRole}</span>
              </span>
            </div>
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

          <span className={styles.divider} aria-hidden="true" />

          <button
            type="button"
            className={styles.menuButton}
            aria-label={isMobileOpen ? closeMenuLabel : openMenuLabel}
            onClick={onToggleMobile}
          >
            {isMobileOpen ? <CloseIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </header>

      <div
        className={`${styles.overlay} ${isMobileOpen ? styles.overlayVisible : ''}`}
        onClick={onCloseMobile}
        aria-hidden="true"
      />

      <div className={`${styles.mobilePanel} ${isMobileOpen ? styles.mobilePanelOpen : ''}`}>
        <div className={styles.mobileSearch}>
          <SearchIcon size={16} className={styles.searchIcon} />
          <input
            type="search"
            className={styles.searchInput}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            onKeyDown={(event) => {
              handleSearchKeyDown(event);
              if (event.key === 'Enter') onCloseMobile();
            }}
          />
        </div>
        <nav className={styles.mobileNav}>{navLinks(onCloseMobile)}</nav>
        <button type="button" className={styles.mobileLogout} onClick={onLogout}>
          <LogoutIcon size={18} />
          <span>{logoutLabel}</span>
        </button>
      </div>
    </>
  );
};
