'use client';

import Link from 'next/link';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { ToothIcon } from '@/components/icons/icons';
import styles from './not-found.module.css';

const NotFound = () => {
  const { t } = useTranslation();

  return (
    <main className={styles.main}>
      <div className={`${styles.blob} ${styles.blobA}`} aria-hidden="true" />
      <div className={`${styles.blob} ${styles.blobB}`} aria-hidden="true" />

      <section className={styles.content}>
        <div className={styles.code}>
          <span className={styles.digit}>4</span>
          <span className={styles.toothWrap}>
            <ToothIcon className={styles.tooth} style={{ fill: 'currentColor', stroke: 'none' }} />
          </span>
          <span className={styles.digit}>4</span>
        </div>

        <h1 className={styles.title}>{t.notFound.title}</h1>
        <p className={styles.text}>{t.notFound.text}</p>

        <div className={styles.actions}>
          <Link href="/" className={styles.primary}>
            {t.notFound.home}
          </Link>
          <Link href="/patients" className={styles.ghost}>
            {t.notFound.toPatients}
          </Link>
        </div>
      </section>
    </main>
  );
};

export default NotFound;
