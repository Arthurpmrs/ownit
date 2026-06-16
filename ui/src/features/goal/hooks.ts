import { useMutation, useQueryClient } from '@tanstack/react-query';
import { showNotification } from '@mantine/notifications';
import { createStudySession, getGoalOptions, updateStudySessionStatus } from './api';
import type { Status } from '@/shared/models';

/**
 * Hook para criar uma nova study session.
 */
export function useCreateStudySession(goalId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudySession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getGoalOptions(goalId).queryKey,
      });
    },
  });
}

type UpdateStatusVariables = {
  sessionId: string;
  currentStatus: Status;
  newStatus: Status;
};

const TRANSITION_ERROR_MESSAGES: Partial<Record<`${Status}->${Status}`, string>> = {
  'doing->to_do': 'Não foi possível mover a sessão de volta para pendente.',
  'done->to_do': 'Não foi possível mover a sessão concluída para pendente.',
  'done->doing': 'Não foi possível reativar a sessão concluída.',
};

const ACTIVE_SESSION_EXISTS_MESSAGE =
  'Já existe uma sessão ativa em outro plano. Finalize-a antes de ativar esta.';

export function useUpdateStudySessionStatus(goalId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ sessionId, newStatus }: UpdateStatusVariables) =>
      updateStudySessionStatus(sessionId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getGoalOptions(goalId).queryKey,
      });
    },
    onError: (error, { currentStatus, newStatus }) => {
      const raw = error instanceof Error ? error.message : '';

      const message = raw.includes('Active session exists')
        ? ACTIVE_SESSION_EXISTS_MESSAGE
        : (TRANSITION_ERROR_MESSAGES[`${currentStatus}->${newStatus}`] ?? raw ?? 'Erro desconhecido');

      showNotification({
        title: 'Erro ao atualizar status',
        message,
        color: 'red',
      });
    },
  });
}
