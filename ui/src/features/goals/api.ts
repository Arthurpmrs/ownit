import { queryOptions } from '@tanstack/react-query';

import type { GoalDTO } from './dto';
import { goalMapper } from './mappers';
import type { CreateGoalData, Goal } from './models';

export function getStudentGoalsOptions(
  studentId: number,
  status: string = '',
  tags: string[] = [],
) {
  return queryOptions({
    queryKey: ['goals', studentId, status, tags],
    queryFn: () => fetchGoalsByStudent(studentId, status, tags),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Fetch goals do backend por student_id
 *
 * @param studentId - ID do estudante
 * @param status - Status do plano
 * @param tags - Tags associada ao plano
 * @returns Promise com lista de Goals transformados
 * @throws Error se a requisição falhar
 */
export async function fetchGoalsByStudent(
  studentId: number,
  status: string = '',
  tags: string[] = [],
): Promise<Goal[]> {
  const url = new URL(
    `${import.meta.env.VITE_API_URL}/goals/student/${studentId}`,
  );

  if (status) {
    url.searchParams.append('status', status);
  }

  tags.forEach((tag) => {
    url.searchParams.append('tags', tag);
  });

  const response = await fetch(url.toString(), {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao buscar goals: ${response.status} ${response.statusText}`,
    );
  }

  const dtos: GoalDTO[] = await response.json();
  return goalMapper.fromDTOList(dtos);
}

/**
 * Cria uma nova goal no backend
 *
 * @param data - Dados da nova goal
 * @returns Promise com a Goal criada
 * @throws Error se a criação falhar
 */
export async function createGoal(data: CreateGoalData): Promise<Goal> {
  const url = `${import.meta.env.VITE_API_URL}/goals`;
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
      `Falha ao criar goal: ${response.status} ${response.statusText}`,
    );
  }

  const dto: GoalDTO = await response.json();
  return goalMapper.fromDTO(dto);
}

export function getGoalByIdOptions(goalId: string) {
  return queryOptions({
    queryKey: ['goal', goalId],
    queryFn: () => fetchGoalById(goalId),
    staleTime: 5 * 60 * 1000,
  });
}

export async function fetchGoalById(goalId: string): Promise<Goal> {
  const url = `${import.meta.env.VITE_API_URL}/goals/${goalId}`;
  const response = await fetch(url, {
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error(
      `Falha ao buscar goal: ${response.status} ${response.statusText}`,
    );
  }

  const data: { goal: GoalDTO; sessions: unknown[] } = await response.json();
  return goalMapper.fromDTO(data.goal);
}
