import type { Status } from '@/shared/models';
import { queryOptions } from '@tanstack/react-query';
import type { CreateStudySessionData } from '../goal/models';
import type {
  PomodoroDTO,
  StudySessionDTO,
  StudySessionWithHistoryDTO,
} from './dto';
import {
  pomodoroMapper,
  studySessionMapper,
  studySessionWithHistoryMapper,
} from './mapper';
import type {
  ChecklistItem,
  EvaluateSessionData,
  Pomodoro,
  StudySession,
  StudySessionWithHistory,
  UpdateChecklistPayload,
} from './models';

export function getStudySessionOptions(sessionId: string) {
  return queryOptions({
    queryKey: ['session', sessionId],
    queryFn: () => fetchStudySession(sessionId),
    staleTime: 5 * 60 * 1000,
  });
}

export async function fetchStudySession(
  sessionId: string,
): Promise<StudySessionWithHistory> {
  const url = `${import.meta.env.VITE_API_URL}/sessions/${sessionId}`;
  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw new Error(
      `Falha ao buscar sessão: ${response.status} ${response.statusText}`,
    );
  }

  const dto: StudySessionWithHistoryDTO = await response.json();
  return studySessionWithHistoryMapper.fromDTO(dto);
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

export async function updatePomodoroStatus({
  sessionId,
  new_status,
}: {
  sessionId: string;
  new_status: string;
}): Promise<Pomodoro> {
  const url = `${import.meta.env.VITE_API_URL}/sessions/${sessionId}/pomodoro`;
  const response = await fetch(url, {
    credentials: 'include',
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_status }),
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao atualizar o status do pomodoro: ${response.status} ${response.statusText}`,
    );
  }

  const dto: PomodoroDTO = await response.json();
  return pomodoroMapper.fromDTO(dto);
}

export async function updateSessionNotes({
  sessionId,
  new_notes,
}: {
  sessionId: string;
  new_notes: string;
}): Promise<void> {
  const url = `${import.meta.env.VITE_API_URL}/sessions/${sessionId}/notes`;
  const response = await fetch(url, {
    credentials: 'include',
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ new_notes }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao salvar anotações: ${response.statusText}`);
  }
}

export async function updateSessionChecklist({
  sessionId,
  checklist,
}: UpdateChecklistPayload): Promise<ChecklistItem[]> {
  const url = `${import.meta.env.VITE_API_URL}/sessions/${sessionId}/checklist`;
  const response = await fetch(url, {
    credentials: 'include',
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ checklist }),
  });

  if (!response.ok) {
    throw new Error(`Falha ao salvar o checklist: ${response.statusText}`);
  }

  const data = await response.json();
  return data.checklist;
}
