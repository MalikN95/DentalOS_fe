import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { extractSubdomainFromHostname } from '@/helpers/tenant';

const APP_DOMAIN = process.env.NEXT_PUBLIC_APP_DOMAIN ?? 'localhost';

// Bare app domain (no clinic subdomain) shows the marketing landing page instead
// of the clinic dashboard; any *.APP_DOMAIN subdomain keeps the existing behavior.
export const middleware = (request: NextRequest) => {
  const host = request.headers.get('host') ?? '';
  const subdomain = extractSubdomainFromHostname(host, APP_DOMAIN);

  if (!subdomain) {
    return NextResponse.rewrite(new URL('/marketing', request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: '/',
};
