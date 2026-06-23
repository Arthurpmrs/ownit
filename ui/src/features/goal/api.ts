import type { Status } from '@/shared/models';
import { durationToIso } from '@/shared/utils';
import { queryOptions } from '@tanstack/react-query';
import type { GoalWithSessionsDTO, MetricsDTO } from './dto';
import { goalWithSessionsMapper, metricsMapper } from './mappers';
import type {
  CreateStudySessionData,
  EvaluateSessionData,
  GoalWithSessions,
  StrategyMetricsData,
  UpdateStudySessionData,
} from './models';
import type { StudySessionDTO } from '../session/dto';
import { studySessionMapper } from '../session/mapper';
import type { StudySession } from '../session/models';

export function getGoalOptions(goalId: string) {
  return queryOptions({
    queryKey: ['goal', goalId],
    queryFn: () => fetchGoal(goalId),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch goal do backend
 *
 * @param goalId - ID da goal
 * @param status - Status do plano
 * @param tags - Tags associada ao plano
 * @returns Promise com lista de Goals transformados
 * @throws Error se a requisição falhar
 */
export async function fetchGoal(goalId: string): Promise<GoalWithSessions> {
  const url = `${import.meta.env.VITE_API_URL}/goals/${goalId}`;
  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao buscar goal: ${response.status} ${response.statusText}`,
    );
  }

  const dto: GoalWithSessionsDTO = await response.json();
  return goalWithSessionsMapper.fromDTO(dto);
}

/**
 * Cria uma nova study session no backend
 *
 * @param data - Dados da nova study session
 * @returns Promise com a StudySession criada
 * @throws Error se a criação falhar
 */
export async function createStudySession(
  data: CreateStudySessionData,
): Promise<StudySession> {
  const url = `${import.meta.env.VITE_API_URL}/sessions`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao criar study session: ${response.status} ${response.statusText}`,
    );
  }

  const dto: StudySessionDTO = await response.json();
  return studySessionMapper.fromDTO(dto);
}

export async function updateStudySession(
  data: UpdateStudySessionData,
): Promise<StudySession> {
  const { sessionId, duration, ...rest } = data;
  const url = `${import.meta.env.VITE_API_URL}/sessions/${sessionId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      ...rest,
      ...(duration !== undefined && { duration: durationToIso(duration) }),
    }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? `${response.status} ${response.statusText}`;
    throw new Error(detail);
  }

  const dto: StudySessionDTO = await response.json();
  return studySessionMapper.fromDTO(dto);
}

export async function updateStudySessionStatus(
  sessionId: string,
  newStatus: Status,
): Promise<StudySession> {
  const url = `${import.meta.env.VITE_API_URL}/sessions/${sessionId}/status`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ new_status: newStatus }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? `${response.status} ${response.statusText}`;
    throw new Error(detail);
  }

  const dto: StudySessionDTO = await response.json();
  return studySessionMapper.fromDTO(dto);
}

export async function evaluateStudySession(
  data: EvaluateSessionData,
): Promise<StudySession> {
  const { sessionId, ...payload } = data;

  const url = `${import.meta.env.VITE_API_URL}/sessions/${sessionId}/evaluate`;
  const response = await fetch(url, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? `${response.status} ${response.statusText}`;
    throw new Error(detail);
  }

  const dto: StudySessionDTO = await response.json();
  return studySessionMapper.fromDTO(dto);
}

export function getMetricsOptions(goalId: string) {
  return queryOptions({
    queryKey: ['metrics', goalId],
    queryFn: () => fetchMetrics(goalId),
    staleTime: 5 * 60 * 1000,
  });
}

export async function fetchMetrics(
  goalId: string,
): Promise<StrategyMetricsData> {
  const url = `${import.meta.env.VITE_API_URL}/goals/${goalId}/metrics`;
  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw new Error(
      `Falha ao buscar métricas: ${response.status} ${response.statusText}`,
    );
  }

  const dto: MetricsDTO = await response.json();
  return metricsMapper.fromDTO(dto);
}

export async function updateGoalStatus(
  goalId: string,
  status: Status,
): Promise<void> {
  const url = `${import.meta.env.VITE_API_URL}/goals/${goalId}`;
  const response = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify({ status }),
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = body?.detail ?? `${response.status} ${response.statusText}`;
    throw new Error(detail);
  }
}
