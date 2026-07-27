'use client';

import { useId, useState } from 'react';
import { format, useTranslation } from '@/common/locale/LocaleProvider';
import type { PatientFileType } from '@/common/types/patient-file';
import { Badge } from '@/components/ui';
import { useToothFiles } from '@/hooks/useToothFiles';
import styles from './ToothFilesSection.module.css';

const FILE_TYPES: PatientFileType[] = ['xray', 'photo', 'document'];

type ToothFilesSectionProps = {
  patientId: string;
  /** Ambient tooth from the chart selection; null lists every tooth's files and uploads a general (unlinked) file. */
  toothNumber: number | null;
  canEdit: boolean;
  className?: string;
};

export const ToothFilesSection = ({
  patientId,
  toothNumber,
  canEdit,
  className,
}: ToothFilesSectionProps) => {
  const { t: dict } = useTranslation();
  const t = dict.dentalChart;
  const fileInputId = useId();
  const [uploadType, setUploadType] = useState<PatientFileType>('xray');

  const { files, isLoading, uploadMutation, deleteMutation } = useToothFiles(
    patientId,
    toothNumber,
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    uploadMutation.mutate({ file, type: uploadType, toothNumber });
  };

  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <span className={styles.heading}>{t.filesTitle}</span>

      {canEdit ? (
        <div className={styles.uploadRow}>
          <select
            className={styles.typeSelect}
            value={uploadType}
            disabled={uploadMutation.isPending}
            onChange={(event) => setUploadType(event.target.value as PatientFileType)}
          >
            {FILE_TYPES.map((type) => (
              <option key={type} value={type}>
                {t.fileType[type]}
              </option>
            ))}
          </select>

          <label htmlFor={fileInputId} className={styles.uploadButton}>
            {uploadMutation.isPending ? t.uploading : t.uploadFile}
          </label>
          <input
            id={fileInputId}
            type="file"
            accept="image/*,.pdf"
            className={styles.fileInput}
            disabled={uploadMutation.isPending}
            onChange={handleFileChange}
          />
        </div>
      ) : null}

      {uploadMutation.isError ? <p className={styles.error}>{t.uploadError}</p> : null}

      {isLoading ? <p className={styles.hint}>{dict.common.loading}</p> : null}

      {!isLoading && files.length === 0 ? (
        <p className={styles.emptyHint}>
          {toothNumber === null ? t.filesEmptyAll : t.filesEmptyForTooth}
        </p>
      ) : null}

      {!isLoading && files.length > 0 ? (
        <div className={styles.grid}>
          {files.map((file) => (
            <div key={file.id} className={styles.card}>
              {file.mimeType.startsWith('image/') ? (
                <a
                  href={file.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.thumbLink}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element -- presigned S3 URL, not a static asset */}
                  <img src={file.downloadUrl} alt={file.fileName} className={styles.thumb} />
                </a>
              ) : (
                <a
                  href={file.downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  className={styles.docLink}
                >
                  {file.fileName}
                </a>
              )}

              <div className={styles.cardMeta}>
                <Badge color="gray">{t.fileType[file.type]}</Badge>
                <span className={styles.cardTooth}>
                  {file.toothNumber
                    ? format(dict.treatmentPlans.toothNumberLabel, { number: file.toothNumber })
                    : dict.treatmentPlans.noTooth}
                </span>
                {canEdit ? (
                  <button
                    type="button"
                    className={styles.removeButton}
                    aria-label={t.removeFile}
                    title={t.removeFile}
                    disabled={deleteMutation.isPending}
                    onClick={() => deleteMutation.mutate(file.id)}
                  >
                    ×
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
