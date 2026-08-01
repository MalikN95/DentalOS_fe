import type { Metadata } from 'next';
import { Roboto } from 'next/font/google';
import { CookieConsentBanner } from '@/components/layout/CookieConsentBanner/CookieConsentBanner';
import { AppProviders } from '@/components/providers/AppProviders';
import './globals.css';

const roboto = Roboto({
  variable: '--font-roboto',
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700'],
});

export const metadata: Metadata = {
  title: 'DentalOS',
  description: 'Dental Practice Management System',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <html lang="ru" className={roboto.variable}>
    <body>
      <AppProviders>
        {children}
        <CookieConsentBanner />
      </AppProviders>
    </body>
  </html>
);

export default RootLayout;
