'use client';

import { useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { MOCK_USER } from '@/common/mocks/auth.mock';
import type { ApiToothState } from '@/common/types/dental-chart';
import type { ApiServiceOption } from '@/common/types/service';
import type { StaffRole } from '@/common/types/staff';
import type { TreatmentPlanItemDraft } from '@/common/types/treatment-plan';
import { ToothPickerField } from '@/components/dental-chart/ToothPickerField/ToothPickerField';
import { ServicePickerField } from '@/components/treatment-plans/ServicePickerField/ServicePickerField';
import { Button } from '@/components/ui';
import { createEmptyTreatmentPlanItemDraft } from '@/helpers/treatment-plan-items';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './TreatmentPlanItemsEditor.module.css';

const SERVICE_CREATE_ROLES: StaffRole[] = ['owner', 'admin'];

type TreatmentPlanItemsEditorProps = {
  items: TreatmentPlanItemDraft[];
  services: ApiServiceOption[];
  chart?: ApiToothState[];
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onChange: (items: TreatmentPlanItemDraft[]) => void;
};

export const TreatmentPlanItemsEditor = ({
  items,
  services,
  chart,
  disabled = false,
  className,
  style,
  onChange,
}: TreatmentPlanItemsEditorProps) => {
  const { t: dict } = useTranslation();
  const t = dict.treatmentPlans;
  const currentUser = useAppSelector(selectCurrentUser) ?? MOCK_USER;
  const canCreateService = SERVICE_CREATE_ROLES.includes(currentUser.role as StaffRole);
  // Services created inline this session, merged with the catalog so they're
  // immediately selectable without waiting for the parent's query to refetch.
  const [createdServices, setCreatedServices] = useState<ApiServiceOption[]>([]);
  const allServices = [...services, ...createdServices.filter(
    (created) => !services.some((service) => service.id === created.id),
  )];

  const updateItem = (key: string, patch: Partial<TreatmentPlanItemDraft>) => {
    onChange(items.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  const handleServiceSelect = (key: string, service: ApiServiceOption) => {
    const item = items.find((row) => row.key === key);
    // Prefill the price from the service catalog, but don't clobber a price
    // the user already typed in for this row.
    const nextPrice = !item?.price ? service.price : item.price;

    updateItem(key, { serviceId: service.id, price: nextPrice });
  };

  const handleServiceCreated = (service: ApiServiceOption) => {
    setCreatedServices((current) => [...current, service]);
  };

  const handleRemove = (key: string) => {
    onChange(items.filter((item) => item.key !== key));
  };

  const handleAdd = () => {
    onChange([...items, createEmptyTreatmentPlanItemDraft()]);
  };

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`} style={style}>
      {items.length === 0 ? <p className={styles.empty}>{t.itemsEmpty}</p> : null}

      {items.map((item) => (
        <div key={item.key} className={styles.row}>
          <ServicePickerField
            services={allServices}
            value={item.serviceId}
            disabled={disabled}
            canCreate={canCreateService}
            onSelect={(service) => handleServiceSelect(item.key, service)}
            onCreated={handleServiceCreated}
          />

          <ToothPickerField
            className={styles.toothField}
            value={item.toothNumber}
            chart={chart}
            disabled={disabled}
            onChange={(toothNumber) => updateItem(item.key, { toothNumber })}
          />

          <input
            type="number"
            min="0"
            step="0.01"
            className={styles.priceInput}
            placeholder={t.priceLabel}
            value={item.price}
            disabled={disabled}
            onChange={(event) => updateItem(item.key, { price: event.target.value })}
          />

          <button
            type="button"
            className={styles.removeButton}
            disabled={disabled}
            aria-label={t.removeItem}
            title={t.removeItem}
            onClick={() => handleRemove(item.key)}
          >
            ×
          </button>
        </div>
      ))}

      <Button type="button" variant="soft" color="gray" disabled={disabled} onClick={handleAdd}>
        {t.addItem}
      </Button>
    </div>
  );
};
