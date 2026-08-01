export const buildRequestHeaders = (accessToken: string | null, init?: HeadersInit): Headers => {
  const headers = new Headers(init);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return headers;
};
