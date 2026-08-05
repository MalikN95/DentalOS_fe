// Strips everything except digits (keeping a leading "+" if present) so the
// same phone string is stored on the booking's PatientEntity and later sent
// to the WhatsApp login-link request — those two calls must match exactly,
// since the backend links a login token to a patient by an exact phone
// string comparison (SmsAuthService#linkPatient), and separately validates
// the login-link request against a stricter digits-only pattern
// (SmsRequestDto) than the booking form itself accepts.
export const normalizePhone = (raw: string): string => {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, '');
  return trimmed.startsWith('+') ? `+${digits}` : digits;
};
