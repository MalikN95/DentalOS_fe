export type PatientMessageChannel = 'email' | 'whatsapp' | 'portal';

export type PatientMessageDirection = 'outbound' | 'inbound';

export type ApiChatMessage = {
  id: string;
  body: string;
  createdAt: string;
  author: {
    id: string;
    firstName: string;
    lastName: string;
  };
};

export type ApiConversationSummary = {
  patientId: string;
  patientName: string;
  lastMessageAt: string;
  lastMessageChannel: PatientMessageChannel;
  lastMessageDirection: PatientMessageDirection;
  lastMessagePreview: string;
};

export type ApiPatientMessage = {
  id: string;
  channel: PatientMessageChannel;
  direction: PatientMessageDirection;
  subject: string | null;
  body: string;
  createdAt: string;
  sentBy: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
};

export type ListPaginationParams = {
  page: number;
  limit: number;
};

export type ChatSelection = { type: 'team' } | { type: 'patient'; patientId: string };
