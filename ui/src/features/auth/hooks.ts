import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMeQueryOptions, login, logout, signup } from './api';
import type { LoginRequest, SignupRequest } from './models';

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

export function useSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (credentials: SignupRequest) => signup(credentials),
    onSuccess: async () => {
      await queryClient.refetchQueries({
        queryKey: getMeQueryOptions().queryKey,
      });
    },
  });
}
