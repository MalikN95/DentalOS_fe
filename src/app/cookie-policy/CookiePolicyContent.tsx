'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import { ReopenCookiePreferencesButton } from './ReopenCookiePreferencesButton';
import styles from './CookiePolicyContent.module.css';

export const CookiePolicyContent = () => {
  const { t } = useTranslation();

  return (
    <div className={styles.page}>
      <div className={styles.doc}>
        <h1 className={styles.title}>{t.cookiePolicy.title}</h1>
        <div className={styles.updatedAt}>{t.cookiePolicy.updatedAt}</div>
        <p className={styles.intro}>{t.cookiePolicy.intro}</p>

        <section className={styles.section}>
          <h2>{t.cookiePolicy.necessaryTitle}</h2>
          <p>{t.cookiePolicy.necessaryText}</p>
        </section>

        <section className={styles.section}>
          <h2>{t.cookiePolicy.analyticsTitle}</h2>
          <p>{t.cookiePolicy.analyticsText}</p>
        </section>

        <section className={styles.section}>
          <h2>{t.cookiePolicy.marketingTitle}</h2>
          <p>{t.cookiePolicy.marketingText}</p>
        </section>

        <section className={styles.section}>
          <h2>{t.cookiePolicy.changeChoiceTitle}</h2>
          <p>{t.cookiePolicy.changeChoiceText}</p>
          <ReopenCookiePreferencesButton label={t.cookiePolicy.reopenButton} />
        </section>

        <section className={styles.section}>
          <h2>{t.cookiePolicy.contactTitle}</h2>
          <p>
            {t.cookiePolicy.contactText} <a href="mailto:privacy@dentalos.ru">privacy@dentalos.ru</a>
          </p>
        </section>
      </div>
    </div>
  );
};
