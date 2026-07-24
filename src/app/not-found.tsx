'use client';

import Link from 'next/link';
import { useTranslation } from '@/common/locale/LocaleProvider';
import styles from './not-found.module.css';

const ToothIcon = () => (
  <svg viewBox="0 0 64 64" className={styles.tooth} aria-hidden="true">
    <path
      d="M32 6C22 6 18 11 12 11c-5 0-7 5-7 12 0 9 3 14 6 22 2 6 3 13 6 13 4 0 3-12 8-12s4 12 8 12c3 0 4-7 6-13 3-8 6-13 6-22 0-7-2-12-7-12-6 0-10-5-16-5Z"
      fill="currentColor"
    />
  </svg>
);

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
            <ToothIcon />
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
