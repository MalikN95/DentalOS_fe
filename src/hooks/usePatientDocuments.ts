'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PatientDocumentType } from '@/common/types/patient-file';
import {
  confirmPatientFileUpload,
  fetchPatientFiles,
  requestPatientFileUpload,
  uploadFileToUrl,
} from '@/helpers/patient-files.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const PATIENT_DOCUMENTS_QUERY_KEY = 'patient-documents';

type UploadDocumentInput = {
  file: File;
  documentType: PatientDocumentType;
  note?: string;
};

export const usePatientDocuments = (patientId: string) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [PATIENT_DOCUMENTS_QUERY_KEY, patientId],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchPatientFiles(accessToken, patientId, { type: 'document', limit: 50 }, signal);
    },
    enabled: Boolean(accessToken) && Boolean(patientId),
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, documentType, note }: UploadDocumentInput) => {
      if (!accessToken) throw new Error('Not authenticated');

      const contentType = file.type || 'application/octet-stream';
      const target = await requestPatientFileUpload(accessToken, patientId, {
        fileName: file.name,
        contentType,
        type: 'document',
      });

      await uploadFileToUrl(target.uploadUrl, file);

      return confirmPatientFileUpload(accessToken, patientId, {
        key: target.key,
        fileName: file.name,
        mimeType: contentType,
        sizeBytes: file.size,
        type: 'document',
        documentType,
        note: note || undefined,
      });
    },
    onSuccess: () =>
      queryClient
        .invalidateQueries({ queryKey: [PATIENT_DOCUMENTS_QUERY_KEY, patientId] })
        .catch(() => undefined),
  });

  return {
    documents: query.data?.items ?? [],
    total: query.data?.total ?? 0,
    isLoading: query.isLoading,
    errorMessage: query.error?.message ?? null,
    uploadMutation,
  };
};
