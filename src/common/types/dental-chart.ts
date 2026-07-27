export type ToothCondition =
  | 'healthy'
  | 'caries'
  | 'filling'
  | 'extracted'
  | 'implant'
  | 'crown'
  | 'other';

export type ApiToothState = {
  toothNumber: number;
  condition: ToothCondition;
  comment: string | null;
  updatedAt: string;
};

export type CreateToothMarkPayload = {
  toothNumber: number;
  condition: ToothCondition;
  comment?: string;
};
