type JwtPayload = {
  sub: string;
  clinicId: string;
  role: string;
};

export const decodeJwtPayload = (token: string): JwtPayload => {
  const [, payloadSegment] = token.split('.');

  if (!payloadSegment) {
    throw new Error('Invalid access token');
  }

  const normalized = payloadSegment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
  const decoded = atob(padded);

  return JSON.parse(decoded) as JwtPayload;
};
