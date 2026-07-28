'use client';

import { useId, useState } from 'react';
import { useTranslation } from '@/common/locale/LocaleProvider';
import { MOCK_USER } from '@/common/mocks/auth.mock';
import type { StaffRole } from '@/common/types/staff';
import type { PatientDocumentType } from '@/common/types/patient-file';
import { ChevronRightIcon, FileTextIcon } from '@/components/icons/icons';
import { Badge, Modal } from '@/components/ui';
import { formatDate } from '@/helpers/date';
import { usePatientDocuments } from '@/hooks/usePatientDocuments';
import { useAppSelector } from '@/store/hooks';
import { selectCurrentUser } from '@/store/slices/auth/selectors';
import styles from './PatientDocuments.module.css';

const EDIT_ROLES: StaffRole[] = ['owner', 'admin', 'doctor', 'receptionist'];
const ACCEPTED_FILE_TYPES = 'application/pdf,image/*';
const DOCUMENT_TYPES: PatientDocumentType[] = [
  'contract',
  'consent',
  'certificate',
  'id',
  'insurance',
  'other',
];

const isAcceptedFile = (file: File): boolean =>
  file.type === 'application/pdf' || file.type.startsWith('image/');

type PatientDocumentsProps = {
  patientId: string;
  className?: string;
  style?: React.CSSProperties;
};

export const PatientDocuments = ({ patientId, className, style }: PatientDocumentsProps) => {
  const { t } = useTranslation();
  const fileInputId = useId();
  const [isOpen, setIsOpen] = useState(false);
  const [typeError, setTypeError] = useState(false);
  const [documentType, setDocumentType] = useState<PatientDocumentType>('other');
  const [note, setNote] = useState('');
  const currentUser = useAppSelector(selectCurrentUser) ?? MOCK_USER;
  const canEdit = EDIT_ROLES.includes(currentUser.role as StaffRole);
  const { documents, total, isLoading, errorMessage, uploadMutation } =
    usePatientDocuments(patientId);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!isAcceptedFile(file)) {
      setTypeError(true);
      return;
    }

    setTypeError(false);
    uploadMutation.mutate(
      { file, documentType, note: note.trim() },
      { onSuccess: () => setNote('') },
    );
  };

  return (
    <>
      <button
        type="button"
        className={`${styles.wrapper} ${className ?? ''}`}
        style={style}
        title={t.patientDocuments.hint}
        onClick={() => setIsOpen(true)}
      >
        <span className={styles.headerIcon}>
          <FileTextIcon size={13} />
        </span>
        <h2 className={styles.heading}>{t.patientDocuments.title}</h2>
        {total > 0 ? (
          <Badge color="gray" className={styles.count}>
            {total}
          </Badge>
        ) : null}
        <span className={styles.chevron}>
          <ChevronRightIcon size={16} />
        </span>
      </button>

      {isOpen ? (
        <Modal
          title={t.patientDocuments.title}
          closeLabel={t.common.close}
          scrollHintLabel={t.common.scrollForMore}
          onClose={() => setIsOpen(false)}
        >
          {canEdit ? (
            <div className={styles.uploadRow}>
              <select
                className={styles.typeSelect}
                value={documentType}
                disabled={uploadMutation.isPending}
                onChange={(event) => setDocumentType(event.target.value as PatientDocumentType)}
              >
                {DOCUMENT_TYPES.map((option) => (
                  <option key={option} value={option}>
                    {t.patientDocuments.documentType[option]}
                  </option>
                ))}
              </select>
              <input
                type="text"
                className={styles.noteInput}
                placeholder={t.patientDocuments.notePlaceholder}
                value={note}
                disabled={uploadMutation.isPending}
                onChange={(event) => setNote(event.target.value)}
              />
              <label htmlFor={fileInputId} className={styles.uploadButton}>
                {uploadMutation.isPending
                  ? t.patientDocuments.uploading
                  : t.patientDocuments.upload}
              </label>
              <input
                id={fileInputId}
                type="file"
                accept={ACCEPTED_FILE_TYPES}
                className={styles.fileInput}
                disabled={uploadMutation.isPending}
                onChange={handleFileChange}
              />
            </div>
          ) : null}

          {typeError ? <p className={styles.error}>{t.patientDocuments.invalidType}</p> : null}
          {uploadMutation.isError ? (
            <p className={styles.error}>{t.patientDocuments.uploadError}</p>
          ) : null}

          {isLoading ? <p className={styles.state}>{t.common.loading}</p> : null}
          {errorMessage ? <p className={styles.state}>{errorMessage}</p> : null}

          {!isLoading && documents.length === 0 ? (
            <p className={styles.state}>{t.patientDocuments.empty}</p>
          ) : null}

          {!isLoading && documents.length > 0 ? (
            <div className={styles.list}>
              {documents.map((file) => (
                <div key={file.id} className={styles.item}>
                  <span className={styles.itemIcon}>
                    <FileTextIcon size={16} />
                  </span>
                  <div className={styles.itemBody}>
                    <span className={styles.itemName}>{file.fileName}</span>
                    <span className={styles.itemMeta}>
                      {file.documentType ? t.patientDocuments.documentType[file.documentType] : ''}
                      {file.documentType ? ' · ' : ''}
                      {formatDate(file.createdAt)}
                    </span>
                    {file.note ? <span className={styles.itemNote}>{file.note}</span> : null}
                  </div>
                  <a
                    href={file.downloadUrl}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.itemDownload}
                  >
                    {t.patientDocuments.download}
                  </a>
                </div>
              ))}
            </div>
          ) : null}
        </Modal>
      ) : null}
    </>
  );
};
