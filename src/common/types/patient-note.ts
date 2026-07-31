import type { StaffRole } from './staff';

export type ApiPatientNoteAuthor = {
  firstName: string;
  lastName: string;
  role: StaffRole;
};

export type ApiPatientNote = {
  id: string;
  text: string;
  createdAt: string;
  author: ApiPatientNoteAuthor;
};
