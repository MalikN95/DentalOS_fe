'use client';

import { Button } from '@/components/ui';
import { openCookiePreferences } from '@/helpers/cookie-consent';

type ReopenCookiePreferencesButtonProps = {
  label: string;
};

export const ReopenCookiePreferencesButton = ({ label }: ReopenCookiePreferencesButtonProps) => (
  <Button color="primary" onClick={openCookiePreferences}>
    {label}
  </Button>
);
