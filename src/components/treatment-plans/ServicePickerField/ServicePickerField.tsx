'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiServiceOption } from '@/common/types/service';
import { ChevronDownIcon } from '@/components/icons/icons';
import { useCreateServiceOption } from '@/hooks/useCreateServiceOption';
import { useFloatingPanelPosition } from '@/hooks/useFloatingPanelPosition';
import styles from './ServicePickerField.module.css';

type ServicePickerFieldProps = {
  services: ApiServiceOption[];
  value: string;
  onSelect: (service: ApiServiceOption) => void;
  onCreated: (service: ApiServiceOption) => void;
  canCreate: boolean;
  disabled?: boolean;
  className?: string;
};

export const ServicePickerField = ({
  services,
  value,
  onSelect,
  onCreated,
  canCreate,
  disabled = false,
  className,
}: ServicePickerFieldProps) => {
  const { t: dict } = useTranslation();
  const t = dict.treatmentPlans;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newPrice, setNewPrice] = useState('');
  const [newDuration, setNewDuration] = useState('30');
  const createMutation = useCreateServiceOption();
  const panelPosition = useFloatingPanelPosition(triggerRef, isOpen);

  const selected = services.find((service) => service.id === value) ?? null;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredServices = services.filter(
    (service) => !normalizedQuery || service.name.toLowerCase().includes(normalizedQuery),
  );
  const hasExactMatch = services.some(
    (service) => service.name.trim().toLowerCase() === normalizedQuery,
  );

  useEffect(() => {
    if (!isOpen) return undefined;

    searchInputRef.current?.focus();

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const isInsideTrigger = triggerRef.current?.contains(target) ?? false;
      const isInsidePanel = panelRef.current?.contains(target) ?? false;

      if (!isInsideTrigger && !isInsidePanel) {
        setIsOpen(false);
        setQuery('');
        setIsCreating(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const closePopover = () => {
    setIsOpen(false);
    setQuery('');
    setIsCreating(false);
  };

  const handleSelect = (service: ApiServiceOption) => {
    onSelect(service);
    closePopover();
  };

  const handleOpenCreate = () => {
    setIsCreating(true);
    setNewPrice('');
    setNewDuration('30');
  };

  const handleConfirmCreate = () => {
    const name = query.trim();
    if (!name || !newPrice.trim() || !newDuration.trim()) return;

    createMutation.mutate(
      { name, price: newPrice.trim(), durationMinutes: Number(newDuration) },
      {
        onSuccess: (service) => {
          onCreated(service);
          handleSelect(service);
        },
      },
    );
  };

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        <span className={`${styles.triggerLabel} ${selected ? '' : styles.placeholder}`}>
          {selected ? selected.name : t.selectService}
        </span>
        <ChevronDownIcon size={16} className={styles.chevron} />
      </button>

      {isOpen && panelPosition
        ? createPortal(
            <div
              ref={panelRef}
              className={styles.popover}
              style={{
                left: panelPosition.left,
                width: panelPosition.width,
                maxHeight: panelPosition.maxHeight,
                top: panelPosition.top,
                bottom: panelPosition.bottom,
              }}
            >
              <input
                ref={searchInputRef}
                type="text"
                className={styles.search}
                placeholder={t.selectService}
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />

              <div className={styles.options}>
                {filteredServices.length === 0 ? (
                  <p className={styles.empty}>{dict.common.nothingFound}</p>
                ) : (
                  filteredServices.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      className={styles.option}
                      onClick={() => handleSelect(service)}
                    >
                      <span className={styles.optionName}>{service.name}</span>
                      <span className={styles.optionPrice}>{service.price}</span>
                    </button>
                  ))
                )}
              </div>

              {query.trim() && !hasExactMatch && canCreate && !isCreating ? (
                <button type="button" className={styles.createOption} onClick={handleOpenCreate}>
                  {format(t.createServiceOption, { name: query.trim() })}
                </button>
              ) : null}

              {query.trim() && !hasExactMatch && canCreate && isCreating ? (
                <div className={styles.createForm}>
                  <span className={styles.createFormTitle}>
                    {format(t.createServiceOption, { name: query.trim() })}
                  </span>
                  <div className={styles.createFormRow}>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      className={styles.createFormInput}
                      placeholder={t.priceLabel}
                      value={newPrice}
                      onChange={(event) => setNewPrice(event.target.value)}
                    />
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className={styles.createFormInput}
                      placeholder={t.newServiceDuration}
                      value={newDuration}
                      onChange={(event) => setNewDuration(event.target.value)}
                    />
                  </div>

                  {createMutation.error ? (
                    <p className={styles.createFormError}>{createMutation.error.message}</p>
                  ) : null}

                  <div className={styles.createFormActions}>
                    <button
                      type="button"
                      className={styles.createFormCancel}
                      onClick={() => setIsCreating(false)}
                    >
                      {dict.common.cancel}
                    </button>
                    <button
                      type="button"
                      className={styles.createFormSubmit}
                      disabled={
                        !newPrice.trim() || !newDuration.trim() || createMutation.isPending
                      }
                      onClick={handleConfirmCreate}
                    >
                      {createMutation.isPending ? dict.common.saving : t.createServiceSubmit}
                    </button>
                  </div>
                </div>
              ) : null}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};
