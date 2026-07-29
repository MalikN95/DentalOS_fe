const CODE_LENGTH = 7;
// 36^7 — exactly the range representable by 7 base-36 digits, so the
// hash below always renders to (at most) 7 characters before padding.
const CODE_RANGE = 36 ** CODE_LENGTH;

// Deterministic 7-character uppercase alphanumeric reference code derived
// from the appointment's UUID — the same appointment always renders the
// same code without needing its own database column.
export const getAppointmentCode = (appointmentId: string): string => {
  let hash = 0;
  for (let index = 0; index < appointmentId.length; index += 1) {
    hash = (hash * 31 + appointmentId.charCodeAt(index)) % CODE_RANGE;
  }
  return hash.toString(36).toUpperCase().padStart(CODE_LENGTH, '0');
};
