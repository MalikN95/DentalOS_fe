import type { BadgeColor } from '@/components/ui';

export type NotificationChannelKey = 'email' | 'whatsapp' | 'push' | 'inApp';

// WhatsApp gets its real brand color (green); the rest map onto the existing
// Badge palette so they stay consistent with the rest of the UI.
export const NOTIFICATION_CHANNEL_COLOR: Record<NotificationChannelKey, BadgeColor> = {
  email: 'info',
  whatsapp: 'success',
  push: 'warning',
  inApp: 'primary',
};
