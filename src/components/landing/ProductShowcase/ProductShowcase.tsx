'use client';

import { useState } from 'react';
import { Tabs } from '@/components/ui';
import styles from './ProductShowcase.module.css';

export type ShowcaseItem = {
  id: string;
  tabLabel: string;
  title: string;
  text: string;
  points: string[];
  render: () => React.ReactNode;
};

type ProductShowcaseProps = {
  items: ShowcaseItem[];
  className?: string;
};

export const ProductShowcase = ({ items, className }: ProductShowcaseProps) => {
  const [activeId, setActiveId] = useState(items[0]?.id ?? '');
  const active = items.find((item) => item.id === activeId) ?? items[0];

  if (!active) return null;

  const tabItems = items.map((item) => ({ id: item.id, label: item.tabLabel }));

  return (
    <div className={`${styles.showcase} ${className ?? ''}`}>
      <Tabs items={tabItems} activeId={active.id} onChange={setActiveId} className={styles.tabs} />
      <div className={styles.body}>
        <div className={styles.mockup}>{active.render()}</div>
        <div className={styles.copy}>
          <h3>{active.title}</h3>
          <p>{active.text}</p>
          <ul>
            {active.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
