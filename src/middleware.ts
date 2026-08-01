import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost';
const APP_HOST = `app.${APP_DOMAIN}`;

// There is no per-clinic subdomain anymore — a single fixed host serves the
// kabinet (login/dashboard) and the public booking widget (/book/{slug}).
// Every other host (the bare root domain, stray old bookmarks, etc.) shows
// the marketing landing page instead.
export const middleware = (request: NextRequest) => {
  const host = (request.headers.get('host') ?? '').split(':')[0];

  if (host !== APP_HOST) {
    return NextResponse.rewrite(new URL('/marketing', request.url));
  }

  // The kabinet's home lives at /dashboard now — bounce the bare root there.
  return NextResponse.redirect(new URL('/dashboard', request.url));
};

export const config = {
  matcher: '/',
};
