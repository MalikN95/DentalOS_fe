export type PatientTag = {
  id: string;
  name: string;
  /** Hue in degrees (0-359); null derives a pastel color from the tag's id. */
  color: number | null;
};

export type CreatePatientTagPayload = {
  name: string;
  color?: number;
};

export type UpdatePatientTagPayload = Partial<CreatePatientTagPayload>;
