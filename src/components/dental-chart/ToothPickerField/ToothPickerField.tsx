'use client';

import { useState } from 'react';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { ApiToothState } from '@/common/types/dental-chart';
import { ToothChart } from '@/components/dental-chart/ToothChart/ToothChart';
import { Button, Modal } from '@/components/ui';
import styles from './ToothPickerField.module.css';

type ToothPickerFieldProps = {
  value: number | null;
  chart?: ApiToothState[];
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onChange: (toothNumber: number | null) => void;
};

export const ToothPickerField = ({
  value,
  chart,
  disabled = false,
  className,
  style,
  onChange,
}: ToothPickerFieldProps) => {
  const { t: dict } = useTranslation();
  const t = dict.treatmentPlans;
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (toothNumber: number) => {
    onChange(toothNumber);
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.trigger} ${className ?? ''}`}
        style={style}
        disabled={disabled}
        onClick={() => setIsOpen(true)}
      >
        {value ? format(t.toothNumberLabel, { number: value }) : t.noTooth}
      </button>

      {isOpen ? (
        <Modal
          title={t.selectToothTitle}
          closeLabel={dict.common.close}
          scrollHintLabel={dict.common.scrollForMore}
          size="sm"
          onClose={() => setIsOpen(false)}
          footer={
            <Button type="button" variant="soft" color="gray" onClick={handleClear}>
              {t.clearTooth}
            </Button>
          }
        >
          <ToothChart value={value} chart={chart} onSelect={handleSelect} />
        </Modal>
      ) : null}
    </>
  );
};
