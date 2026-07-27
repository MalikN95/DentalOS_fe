'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { PatientFileType } from '@/common/types/patient-file';
import {
  confirmPatientFileUpload,
  deletePatientFile,
  fetchPatientFiles,
  requestPatientFileUpload,
  uploadFileToUrl,
} from '@/helpers/patient-files.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const TOOTH_FILES_QUERY_KEY = 'patient-tooth-files';

/** `toothNumber: null` lists every file for the patient, across all teeth. */
export const useToothFiles = (patientId: string, toothNumber: number | null) => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: [TOOTH_FILES_QUERY_KEY, patientId, toothNumber],
    queryFn: ({ signal }) => {
      if (!accessToken) throw new Error('Not authenticated');
      return fetchPatientFiles(
        accessToken,
        patientId,
        { toothNumber: toothNumber ?? undefined, limit: 50 },
        signal,
      );
    },
    enabled: Boolean(accessToken) && Boolean(patientId),
  });

  const invalidate = () =>
    // Prefix match: refreshes both this view and the per-tooth / all-teeth
    // counterpart, whichever the user switches to next.
    queryClient
      .invalidateQueries({ queryKey: [TOOTH_FILES_QUERY_KEY, patientId] })
      .catch(() => undefined);

  const uploadMutation = useMutation({
    mutationFn: async ({
      file,
      type,
      toothNumber: targetTooth,
    }: {
      file: File;
      type: PatientFileType;
      toothNumber: number | null;
    }) => {
      if (!accessToken) throw new Error('Not authenticated');

      const contentType = file.type || 'application/octet-stream';
      const target = await requestPatientFileUpload(accessToken, patientId, {
        fileName: file.name,
        contentType,
        type,
      });

      await uploadFileToUrl(target.uploadUrl, file);

      return confirmPatientFileUpload(accessToken, patientId, {
        key: target.key,
        fileName: file.name,
        mimeType: contentType,
        sizeBytes: file.size,
        type,
        toothNumber: targetTooth ?? undefined,
      });
    },
    onSuccess: invalidate,
  });

  const deleteMutation = useMutation({
    mutationFn: (fileId: string) => {
      if (!accessToken) throw new Error('Not authenticated');
      return deletePatientFile(accessToken, fileId);
    },
    onSuccess: invalidate,
  });

  return {
    files: query.data?.items ?? [],
    isLoading: query.isLoading,
    uploadMutation,
    deleteMutation,
  };
};
