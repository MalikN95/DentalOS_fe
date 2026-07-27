import type {
  ApiTreatmentPlanItem,
  TreatmentPlanItemDraft,
  TreatmentPlanItemPayload,
} from '@/common/types/treatment-plan';

export const createEmptyTreatmentPlanItemDraft = (): TreatmentPlanItemDraft => ({
  key: crypto.randomUUID(),
  serviceId: '',
  toothNumber: null,
  price: '',
});

export const apiItemToDraft = (item: ApiTreatmentPlanItem): TreatmentPlanItemDraft => ({
  key: item.id,
  serviceId: item.serviceId,
  toothNumber: item.toothNumber,
  price: item.price,
});

export const draftToPayload = (
  draft: TreatmentPlanItemDraft,
  index: number,
): TreatmentPlanItemPayload => ({
  serviceId: draft.serviceId,
  toothNumber: draft.toothNumber ?? undefined,
  price: draft.price.trim() || undefined,
  sortOrder: index,
});
