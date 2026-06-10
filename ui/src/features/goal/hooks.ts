import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createStudySession, getGoalOptions } from './api';

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
