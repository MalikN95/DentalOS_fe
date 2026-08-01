'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { Button, SwitchToggle } from '@/components/ui';
import {
  OPEN_COOKIE_PREFERENCES_EVENT,
  readCookieConsent,
  writeCookieConsent,
  type CookieConsentValue,
} from '@/helpers/cookie-consent';
import styles from './CookieConsentBanner.module.css';

type Mode = 'hidden' | 'banner' | 'preferences';

const DEFAULT_DRAFT: CookieConsentValue = { necessary: true, analytics: true, marketing: false };

export const CookieConsentBanner = () => {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('hidden');
  const [draft, setDraft] = useState<CookieConsentValue>(DEFAULT_DRAFT);

  useEffect(() => {
    const existing = readCookieConsent();

    if (!existing) {
      // One-time sync from an external system (the consent cookie) right after
      // mount — not per-render derived state, so this isn't a cascading-render risk.
      // eslint-disable-next-line react-hooks/set-state-in-effect -- mount-only read of the consent cookie
      setMode('banner');
    } else {
      setDraft(existing);
    }

    const handleReopen = () => {
      setDraft(readCookieConsent() ?? DEFAULT_DRAFT);
      setMode('preferences');
    };

    window.addEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleReopen);
    return () => window.removeEventListener(OPEN_COOKIE_PREFERENCES_EVENT, handleReopen);
  }, []);

  const persistConsent = (value: CookieConsentValue) => {
    writeCookieConsent(value);
    setMode('hidden');
  };

  const handleAcceptAll = () =>
    persistConsent({ necessary: true, analytics: true, marketing: true });
  const handleRejectNonEssential = () =>
    persistConsent({ necessary: true, analytics: false, marketing: false });
  const handleSavePreferences = () => persistConsent(draft);
  const handleOpenPreferences = () => setMode('preferences');
  const handleAnalyticsChange = (checked: boolean) =>
    setDraft((prev) => ({ ...prev, analytics: checked }));
  const handleMarketingChange = (checked: boolean) =>
    setDraft((prev) => ({ ...prev, marketing: checked }));

  if (mode === 'hidden') return null;

  if (mode === 'preferences') {
    return (
      <div className={styles.overlay}>
        <div className={styles.panel}>
          <div className={styles.title}>{t.cookieConsent.preferencesTitle}</div>
          <div className={styles.subtitle}>{t.cookieConsent.preferencesSubtitle}</div>

          <div className={styles.row}>
            <div>
              <div className={styles.rowLabel}>{t.cookieConsent.necessaryLabel}</div>
              <div className={styles.rowDesc}>{t.cookieConsent.necessaryDesc}</div>
            </div>
            <SwitchToggle checked disabled />
          </div>

          <div className={styles.row}>
            <div>
              <div className={styles.rowLabel}>{t.cookieConsent.analyticsLabel}</div>
              <div className={styles.rowDesc}>{t.cookieConsent.analyticsDesc}</div>
            </div>
            <SwitchToggle checked={draft.analytics} onChange={handleAnalyticsChange} />
          </div>

          <div className={styles.row}>
            <div>
              <div className={styles.rowLabel}>{t.cookieConsent.marketingLabel}</div>
              <div className={styles.rowDesc}>{t.cookieConsent.marketingDesc}</div>
            </div>
            <SwitchToggle checked={draft.marketing} onChange={handleMarketingChange} />
          </div>

          <div className={styles.actions}>
            <Button color="gray" variant="outline" onClick={handleRejectNonEssential}>
              {t.cookieConsent.rejectNonEssential}
            </Button>
            <Button color="primary" onClick={handleSavePreferences}>
              {t.cookieConsent.save}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.bar}>
      <div className={styles.text}>
        {t.cookieConsent.bannerText}{' '}
        <Link href="/cookie-policy" className={styles.link}>
          {t.cookieConsent.policyLinkText}
        </Link>
        .
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.linkButton} onClick={handleOpenPreferences}>
          {t.cookieConsent.customize}
        </button>
        <Button color="gray" variant="outline" onClick={handleRejectNonEssential}>
          {t.cookieConsent.rejectNonEssential}
        </Button>
        <Button color="primary" onClick={handleAcceptAll}>
          {t.cookieConsent.acceptAll}
        </Button>
      </div>
    </div>
  );
};
