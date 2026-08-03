'use client';

import styles from './AccordionSection.module.css';

type AccordionSectionProps = {
  icon: React.ReactNode;
  title: string;
  count?: number;
  isOpen: boolean;
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  onToggle?: () => void;
};

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
    className={`${styles.chevron} ${isOpen ? styles.chevronOpen : ''}`}
  >
    <path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export const AccordionSection = ({
  icon,
  title,
  count,
  isOpen,
  children,
  className,
  style,
  onToggle,
}: AccordionSectionProps) => (
  <div className={`${styles.card} ${className ?? ''}`} style={style}>
    <button type="button" className={styles.header} onClick={onToggle} aria-expanded={isOpen}>
      <span className={styles.icon}>{icon}</span>
      <span className={styles.title}>{title}</span>
      {typeof count === 'number' && count > 0 ? (
        <span className={styles.count}>{count}</span>
      ) : null}
      <ChevronIcon isOpen={isOpen} />
    </button>
    {isOpen ? <div className={styles.body}>{children}</div> : null}
  </div>
);
