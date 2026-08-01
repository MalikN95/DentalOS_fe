import type { Metadata } from 'next';
import { LandingPageContent } from './LandingPageContent';

export const metadata: Metadata = {
  title: 'DentalOS — система управления стоматологической клиникой',
  description:
    'Расписание врачей, онлайн-запись, карты пациентов и финансы — в одном интерфейсе для стоматологических клиник.',
};

const MarketingLandingPage = () => <LandingPageContent />;

export default MarketingLandingPage;
