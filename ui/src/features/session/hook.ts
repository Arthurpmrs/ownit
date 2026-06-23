import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStudySessionOptions,
  updatePomodoroStatus,
  updateSessionNotes,
} from './api';

export default function useUpdatePomodoroStatus(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updatePomodoroStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getStudySessionOptions(sessionId).queryKey,
      });
    },
  });
}

export function useUpdateSessionNotes(sessionId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateSessionNotes,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: getStudySessionOptions(sessionId).queryKey,
      });
    },
  });
}
