import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGoal, getStudentGoalsOptions } from './api';

/**
 * Hook para criar uma nova goal
 *
 * Usa useMutation do React Query para:
 * - Gerenciar estado de loading/success/error
 * - Invalidar queries após sucesso
 * - Retry automático em falhas
 */
export function useCreateGoal(studentId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createGoal,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getStudentGoalsOptions(studentId).queryKey,
      });
    },
  });
}
