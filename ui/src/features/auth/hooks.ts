import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMeQueryOptions, login, logout } from './api';
import type { LoginRequest } from './models';

export function useMe() {
  const { data, isLoading, error, isSuccess } = useQuery(getMeQueryOptions());

  return {
    data,
    isLoading,
    error,
    isAuthenticated: isSuccess && !!data,
  };
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: LoginRequest) => login(credentials),
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: getMeQueryOptions().queryKey,
      });
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.removeQueries({
        queryKey: getMeQueryOptions().queryKey,
      });
    },
  });
}
