import type { Metadata } from 'next';
import { CookiePolicyContent } from './CookiePolicyContent';

export const metadata: Metadata = {
  title: 'Политика использования cookie — DentalOS',
};

const CookiePolicyPage = () => <CookiePolicyContent />;

export default CookiePolicyPage;
