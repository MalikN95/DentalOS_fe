'use client';

import Link from 'next/link';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { Badge, Button } from '@/components/ui';
import {
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  Logo,
  MessageIcon,
  PatientsIcon,
  StaffIcon,
  StarIcon,
  ToothIcon,
  WalletIcon,
} from '@/components/icons/icons';
import { openCookiePreferences } from '@/helpers/cookie-consent';
import {
  ProductShowcase,
  type ShowcaseItem,
} from '@/components/landing/ProductShowcase/ProductShowcase';
import {
  BoardMockup,
  BookingMockup,
  ChartMockup,
  FinanceMockup,
  ReviewsMockup,
} from '@/components/landing/ProductShowcase/Mockups';
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
    { icon: FileTextIcon, title: t.landing.feature7Title, text: t.landing.feature7Text },
    { icon: MessageIcon, title: t.landing.feature8Title, text: t.landing.feature8Text },
    { icon: PatientsIcon, title: t.landing.feature9Title, text: t.landing.feature9Text },
  ];

  const showcaseItems: ShowcaseItem[] = [
    {
      id: 'board',
      tabLabel: t.landing.showcaseTabBoard,
      title: t.landing.showcaseBoardTitle,
      text: t.landing.showcaseBoardText,
      points: [t.landing.showcaseBoardPoint1, t.landing.showcaseBoardPoint2],
      render: () => <BoardMockup />,
    },
    {
      id: 'chart',
      tabLabel: t.landing.showcaseTabChart,
      title: t.landing.showcaseChartTitle,
      text: t.landing.showcaseChartText,
      points: [t.landing.showcaseChartPoint1, t.landing.showcaseChartPoint2],
      render: () => <ChartMockup />,
    },
    {
      id: 'booking',
      tabLabel: t.landing.showcaseTabBooking,
      title: t.landing.showcaseBookingTitle,
      text: t.landing.showcaseBookingText,
      points: [t.landing.showcaseBookingPoint1, t.landing.showcaseBookingPoint2],
      render: () => <BookingMockup />,
    },
    {
      id: 'finance',
      tabLabel: t.landing.showcaseTabFinance,
      title: t.landing.showcaseFinanceTitle,
      text: t.landing.showcaseFinanceText,
      points: [t.landing.showcaseFinancePoint1, t.landing.showcaseFinancePoint2],
      render: () => <FinanceMockup />,
    },
    {
      id: 'reviews',
      tabLabel: t.landing.showcaseTabReviews,
      title: t.landing.showcaseReviewsTitle,
      text: t.landing.showcaseReviewsText,
      points: [t.landing.showcaseReviewsPoint1, t.landing.showcaseReviewsPoint2],
      render: () => <ReviewsMockup />,
    },
  ];

  const steps = [
    { title: t.landing.step1Title, text: t.landing.step1Text },
    { title: t.landing.step2Title, text: t.landing.step2Text },
    { title: t.landing.step3Title, text: t.landing.step3Text },
  ];

  return (
    <div className={styles.page}>
      <nav className={styles.nav}>
        <Logo height={22} className={styles.logo} />
        <div className={styles.navLinks}>
          <a href="#features">{t.landing.navFeatures}</a>
          <a href="#pricing">{t.landing.navPricing}</a>
        </div>
        <div className={styles.navActions}>
          <Link href="/login" className={styles.navLogin}>
            {t.landing.navLogin}
          </Link>
          <a href={`mailto:${SALES_EMAIL}`}>
            <Button color="primary" className={styles.ctaGlow}>
              {t.landing.navCta}
            </Button>
          </a>
        </div>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.heroEyebrow}>{t.landing.heroEyebrow}</span>
          <h1 className={styles.heroTitle}>{t.landing.heroTitle}</h1>
          <p className={styles.heroText}>{t.landing.heroText}</p>
          <p className={styles.heroKicker}>{t.landing.heroKicker}</p>
          <div className={styles.heroActions}>
            <a href={`mailto:${SALES_EMAIL}`}>
              <Button color="primary" className={styles.ctaGlow}>
                {t.landing.heroCta}
              </Button>
            </a>
            <Link href="/login">
              <Button color="gray" variant="outline">
                {t.landing.heroSecondary}
              </Button>
            </Link>
          </div>
          <p className={styles.trialNote}>{t.landing.trialNote}</p>
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

      <section className={styles.marketplace}>
        <span className={styles.sectionEyebrow}>01</span>
        <div className={styles.marketplaceBody}>
          <div>
            <h2 className={styles.marketplaceTitle}>{t.landing.marketplaceTitle}</h2>
            <p className={styles.marketplaceText}>{t.landing.marketplaceText}</p>
          </div>
          <ul className={styles.marketplaceList}>
            <li>{t.landing.marketplacePoint1}</li>
            <li>{t.landing.marketplacePoint2}</li>
          </ul>
        </div>
      </section>

      <section className={styles.showcaseSection}>
        <span className={styles.sectionEyebrow}>02</span>
        <h2 className={styles.sectionTitle}>{t.landing.showcaseTitle}</h2>
        <p className={styles.showcaseSubtitle}>{t.landing.showcaseSubtitle}</p>
        <ProductShowcase items={showcaseItems} />
      </section>

      <section id="features" className={styles.features}>
        <span className={styles.sectionEyebrow}>03</span>
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
        <span className={styles.sectionEyebrow}>04</span>
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
        <span className={styles.sectionEyebrowLight}>05</span>
        <h2>{t.landing.pricingTitle}</h2>
        <p>{t.landing.pricingText}</p>
        <a href={`mailto:${SALES_EMAIL}`}>
          <Button color="primary" className={styles.ctaGlow}>
            {t.landing.pricingCta}
          </Button>
        </a>
        <p className={styles.trialNoteLight}>{t.landing.trialNote}</p>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerAbout}>
          <Logo height={20} className={styles.logo} />
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
