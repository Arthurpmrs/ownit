import {
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from '@tanstack/react-query';
import { showNotification } from '@mantine/notifications';
import {
  createStudySession,
  evaluateStudySession,
  getGoalOptions,
  getMetricsOptions,
  updateStudySession,
  updateStudySessionStatus,
  updateGoalStatus,
} from './api';
import { getStudentGoalsOptions } from '@/features/goals/api';
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
      queryClient.invalidateQueries({
        queryKey: getMetricsOptions(goalId).queryKey,
      });
    },
  });
}

type UpdateStatusVariables = {
  sessionId: string;
  currentStatus: Status;
  newStatus: Status;
};

const TRANSITION_ERROR_MESSAGES: Partial<
  Record<`${Status}->${Status}`, string>
> = {
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
      queryClient.invalidateQueries({
        queryKey: getMetricsOptions(goalId).queryKey,
      });
    },
    onError: (error, { currentStatus, newStatus }) => {
      const raw = error instanceof Error ? error.message : '';

      const message = raw.includes('Active session exists')
        ? ACTIVE_SESSION_EXISTS_MESSAGE
        : (TRANSITION_ERROR_MESSAGES[`${currentStatus}->${newStatus}`] ??
          raw ??
          'Erro desconhecido');

      showNotification({
        title: 'Erro ao atualizar status',
        message,
        color: 'red',
      });
    },
  });
}

export function useEvaluateStudySession(goalId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: evaluateStudySession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getGoalOptions(goalId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getMetricsOptions(goalId).queryKey,
      });
    },
    onError: () => {
      showNotification({
        title: 'Erro ao finalizar sessão.',
        message: 'Não foi possível finalizar a sessão.',
        color: 'red',
      });
    },
  });
}

export function useUpdateStudySession(goalId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateStudySession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getGoalOptions(goalId).queryKey,
      });
      queryClient.invalidateQueries({
        queryKey: getMetricsOptions(goalId).queryKey,
      });
    },
    onError: () => {
      showNotification({
        title: 'Erro ao editar sessão',
        message: 'Não foi possível salvar as alterações.',
        color: 'red',
      });
    },
  });
}

export function useStrategyMetrics(goalId: string) {
  return useSuspenseQuery(getMetricsOptions(goalId));
}

export function useUpdateGoalStatus(goalId: string, studentId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newStatus: Status) => updateGoalStatus(goalId, newStatus),
    onSuccess: () => {
      queryClient.invalidateQueries(getGoalOptions(goalId));
      if (studentId !== undefined) {
        queryClient.invalidateQueries(getStudentGoalsOptions(studentId));
      }
    },
    onError: () => {
      showNotification({
        title: 'Erro ao atualizar status.',
        message: 'Não foi possível atualizar o status da goal.',
        color: 'red',
      });
    },
  });
}
