'use client';

import Link from 'next/link';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { Badge, Button } from '@/components/ui';
import {
  CalendarIcon,
  ClockIcon,
  StaffIcon,
  StarIcon,
  ToothIcon,
  WalletIcon,
} from '@/components/icons/icons';
import { openCookiePreferences } from '@/helpers/cookie-consent';
import styles from './LandingPageContent.module.css';

const SALES_EMAIL = 'sales@dentalos.ru';

export const LandingPageContent = () => {
  const { t } = useTranslation();

  const features = [
    { icon: CalendarIcon, title: t.landing.feature1Title, text: t.landing.feature1Text },
    { icon: StaffIcon, title: t.landing.feature2Title, text: t.landing.feature2Text },
    { icon: ClockIcon, title: t.landing.feature3Title, text: t.landing.feature3Text },
    { icon: WalletIcon, title: t.landing.feature4Title, text: t.landing.feature4Text },
    { icon: StarIcon, title: t.landing.feature5Title, text: t.landing.feature5Text },
    { icon: ToothIcon, title: t.landing.feature6Title, text: t.landing.feature6Text },
  ];

  const steps = [
    { title: t.landing.step1Title, text: t.landing.step1Text },
    { title: t.landing.step2Title, text: t.landing.step2Text },
    { title: t.landing.step3Title, text: t.landing.step3Text },
  ];

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <div className={styles.logo}>
          Dental<span>OS</span>
        </div>
        <div className={styles.navLinks}>
          <a href="#features">{t.landing.navFeatures}</a>
          <a href="#pricing">{t.landing.navPricing}</a>
        </div>
        <div className={styles.navActions}>
          <Link href="/login" className={styles.navLogin}>
            {t.landing.navLogin}
          </Link>
          <a href={`mailto:${SALES_EMAIL}`}>
            <Button color="primary">{t.landing.navCta}</Button>
          </a>
        </div>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.heroEyebrow}>{t.landing.heroEyebrow}</span>
          <h1 className={styles.heroTitle}>{t.landing.heroTitle}</h1>
          <p className={styles.heroText}>{t.landing.heroText}</p>
          <div className={styles.heroActions}>
            <a href={`mailto:${SALES_EMAIL}`}>
              <Button color="primary">{t.landing.heroCta}</Button>
            </a>
            <Link href="/login">
              <Button color="gray" variant="outline">
                {t.landing.heroSecondary}
              </Button>
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual}>
          <div className={styles.visualCard}>
            <div className={styles.visualRow}>
              <Badge color="success">{t.landing.visitArrived}</Badge>
              <span>Иванов Иван · 10:00–11:00</span>
            </div>
            <div className={styles.visualRow}>
              <Badge color="info">{t.landing.visitInTreatment}</Badge>
              <span>Смирнов Пётр · 11:35–12:05</span>
            </div>
          </div>
          <div className={styles.visualCard}>
            <div className={styles.visualRow}>
              <Badge color="warning">{t.landing.visitOnlineBooking}</Badge>
            </div>
          </div>
        </div>
      </header>

      <div className={styles.trust}>
        <span className={styles.trustText}>
          <strong>127</strong> {t.landing.trustText}
        </span>
        <span className={styles.trustChip}>Максимум</span>
        <span className={styles.trustChip}>Дента+</span>
        <span className={styles.trustChip}>Улыбка 32</span>
        <span className={styles.trustChip}>ОртоЦентр</span>
      </div>

      <section id="features" className={styles.features}>
        <h2 className={styles.sectionTitle}>{t.landing.featuresTitle}</h2>
        <div className={styles.featureGrid}>
          {features.map((feature) => (
            <div key={feature.title} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <feature.icon size={20} />
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.steps}>
        <h2 className={styles.sectionTitle}>{t.landing.stepsTitle}</h2>
        <div className={styles.stepsRow}>
          {steps.map((step, index) => (
            <div key={step.title} className={styles.step}>
              <div className={styles.stepNum}>{index + 1}</div>
              <h4>{step.title}</h4>
              <p>{step.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className={styles.pricing}>
        <h2>{t.landing.pricingTitle}</h2>
        <p>{t.landing.pricingText}</p>
        <a href={`mailto:${SALES_EMAIL}`}>
          <Button color="primary">{t.landing.pricingCta}</Button>
        </a>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerAbout}>
          <div className={styles.logo}>
            Dental<span>OS</span>
          </div>
          <p>{t.landing.footerAbout}</p>
        </div>
        <div className={styles.footerCol}>
          <h6>{t.landing.footerProduct}</h6>
          <a href="#features">{t.landing.navFeatures}</a>
          <a href="#pricing">{t.landing.navPricing}</a>
          <Link href="/login">{t.landing.footerLogin}</Link>
        </div>
        <div className={styles.footerCol}>
          <h6>{t.landing.footerLegal}</h6>
          <Link href="/cookie-policy">{t.landing.footerCookiePolicy}</Link>
          <button type="button" className={styles.footerLinkButton} onClick={openCookiePreferences}>
            {t.landing.footerCookieSettings}
          </button>
        </div>
      </footer>
    </div>
  );
};
