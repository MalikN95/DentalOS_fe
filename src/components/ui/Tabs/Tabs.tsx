'use client';

import styles from './Tabs.module.css';

export type TabItem = {
  id: string;
  label: string;
};

type TabsProps = {
  items: TabItem[];
  activeId: string;
  className?: string;
  style?: React.CSSProperties;
  onChange?: (id: string) => void;
};

export const Tabs = ({ items, activeId, className, style, onChange }: TabsProps) => (
  <div className={`${styles.tabs} ${className ?? ''}`} style={style} role="tablist">
    {items.map((item) => (
      <button
        key={item.id}
        type="button"
        role="tab"
        aria-selected={item.id === activeId}
        className={`${styles.tab} ${item.id === activeId ? styles.tabActive : ''}`}
        onClick={() => onChange?.(item.id)}
      >
        {item.label}
      </button>
    ))}
  </div>
);
