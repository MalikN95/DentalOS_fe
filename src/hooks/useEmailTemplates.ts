'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { deleteEmailTemplate, fetchEmailTemplates } from '@/helpers/email-templates.api';
import { useAppSelector } from '@/store/hooks';
import { selectAccessToken } from '@/store/slices/auth/selectors';

export const EMAIL_TEMPLATES_QUERY_KEY = ['settings', 'email-templates'] as const;

export const useEmailTemplates = () => {
  const accessToken = useAppSelector(selectAccessToken);
  const queryClient = useQueryClient();

  const templatesQuery = useQuery({
    queryKey: EMAIL_TEMPLATES_QUERY_KEY,
    queryFn: ({ signal }) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return fetchEmailTemplates(accessToken, signal);
    },
    enabled: Boolean(accessToken),
  });

  const deleteMutation = useMutation({
    mutationFn: (templateId: string) => {
      if (!accessToken) {
        throw new Error('Not authenticated');
      }

      return deleteEmailTemplate(accessToken, templateId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: EMAIL_TEMPLATES_QUERY_KEY });
    },
  });

  return { templatesQuery, deleteMutation };
};
