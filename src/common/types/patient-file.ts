export type PatientFileType = 'photo' | 'xray' | 'document';

export type ApiPatientFile = {
  id: string;
  patientId: string;
  medicalRecordId: string | null;
  type: PatientFileType;
  toothNumber: number | null;
  fileKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  downloadUrl: string;
};

export type PatientFilesPage = {
  items: ApiPatientFile[];
  total: number;
  page: number;
  limit: number;
};
