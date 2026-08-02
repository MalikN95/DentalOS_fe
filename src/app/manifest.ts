import type { MetadataRoute } from 'next';

const manifest = (): MetadataRoute.Manifest => ({
  id: '/dashboard',
  name: 'DentalOS — система управления стоматологической клиникой',
  short_name: 'DentalOS',
  description:
    'Расписание врачей, онлайн-запись, карты пациентов и финансы — в одном интерфейсе для стоматологических клиник.',
  start_url: '/dashboard',
  scope: '/',
  display: 'standalone',
  orientation: 'portrait-primary',
  lang: 'ru',
  background_color: '#ffffff',
  theme_color: '#5c59e8',
  icons: [
    {
      src: '/icon.svg',
      sizes: 'any',
      type: 'image/svg+xml',
      purpose: 'any',
    },
    {
      src: '/icon-192.png',
      sizes: '192x192',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icon-512.png',
      sizes: '512x512',
      type: 'image/png',
      purpose: 'any',
    },
    {
      src: '/icon-512.svg',
      sizes: '512x512',
      type: 'image/svg+xml',
      purpose: 'maskable',
    },
  ],
});

export default manifest;
