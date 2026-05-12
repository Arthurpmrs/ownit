import { queryOptions } from '@tanstack/react-query';
import type { LoginRequest, Student } from './models';

const API_URL = import.meta.env.VITE_API_URL;

export function getMeQueryOptions() {
  return queryOptions({
    queryKey: ['auth', 'me'],
    queryFn: () => fetchMe(),
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: false,
  });
}

export async function fetchMe(): Promise<Student> {
  const response = await fetch(`${API_URL}/auth/me`, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(`Não autenticado: ${response.status}`);
  }

  return response.json();
}

export async function login(data: LoginRequest): Promise<void> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || `Falha no login: ${response.status}`);
  }
}

export async function logout(): Promise<void> {
  await fetch(`${API_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
  }).catch(() => {});
}
