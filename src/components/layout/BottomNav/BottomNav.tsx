'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { PinIcon } from '@/components/icons/icons';
import { useBottomNavPin } from '@/hooks/useBottomNavPin';
import styles from './BottomNav.module.css';

export type BottomNavItem = {
  id: string;
  label: string;
  href: string;
  icon: React.ReactNode;
};

type BottomNavProps = {
  items: BottomNavItem[];
  activeId: string;
  className?: string;
};

export const BottomNav = ({ items, activeId, className }: BottomNavProps) => {
  const { t } = useTranslation();
  const { isPinned, togglePinned } = useBottomNavPin();
  const [isHovering, setIsHovering] = useState(false);
  const isExpanded = isPinned || isHovering;

  if (items.length === 0) return null;

  return (
    <div
      className={`${styles.wrap} ${isExpanded ? styles.wrapExpanded : ''} ${className ?? ''}`}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <button
        type="button"
        className={styles.handle}
        aria-label={isExpanded ? t.nav.closeMenu : t.nav.openMenu}
        aria-expanded={isExpanded}
        onClick={() => setIsHovering(true)}
      />

      <nav className={styles.bar} aria-label="Secondary" aria-hidden={!isExpanded}>
        <button
          type="button"
          className={`${styles.pin} ${isPinned ? styles.pinActive : ''}`}
          title={isPinned ? t.nav.unpinPanel : t.nav.pinPanel}
          aria-label={isPinned ? t.nav.unpinPanel : t.nav.pinPanel}
          aria-pressed={isPinned}
          tabIndex={isExpanded ? 0 : -1}
          onClick={togglePinned}
        >
          <PinIcon size={16} />
        </button>

        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            className={`${styles.item} ${item.id === activeId ? styles.itemActive : ''}`}
            title={item.label}
            tabIndex={isExpanded ? 0 : -1}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
};
