export type PatientFileType = 'photo' | 'xray' | 'document';

export type PatientDocumentType =
  | 'contract'
  | 'consent'
  | 'certificate'
  | 'id'
  | 'insurance'
  | 'other';

export type ApiPatientFile = {
  id: string;
  patientId: string;
  medicalRecordId: string | null;
  type: PatientFileType;
  documentType: PatientDocumentType | null;
  note: string | null;
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
