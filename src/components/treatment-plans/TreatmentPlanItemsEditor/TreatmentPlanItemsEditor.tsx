'use client';

import { useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiToothState } from '@/common/types/dental-chart';
import type { ApiServiceOption } from '@/common/types/service';
import type { TreatmentPlanItemDraft } from '@/common/types/treatment-plan';
import { ToothPickerField } from '@/components/dental-chart/ToothPickerField/ToothPickerField';
import { Button } from '@/components/ui';
import { createEmptyTreatmentPlanItemDraft } from '@/helpers/treatment-plan-items';
import styles from './TreatmentPlanItemsEditor.module.css';

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
  const serviceById = new Map(services.map((service) => [service.id, service]));

  const updateItem = (key: string, patch: Partial<TreatmentPlanItemDraft>) => {
    onChange(items.map((item) => (item.key === key ? { ...item, ...patch } : item)));
  };

  const handleServiceChange = (key: string, serviceId: string) => {
    const item = items.find((row) => row.key === key);
    const service = serviceById.get(serviceId);
    // Prefill the price from the service catalog, but don't clobber a price
    // the user already typed in for this row.
    const nextPrice = service && !item?.price ? service.price : item?.price;

    updateItem(key, { serviceId, price: nextPrice ?? '' });
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
          <select
            className={styles.select}
            value={item.serviceId}
            disabled={disabled}
            onChange={(event) => handleServiceChange(item.key, event.target.value)}
          >
            <option value="">{t.selectService}</option>
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>

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
