import { queryOptions } from '@tanstack/react-query';
import type { GoalWithSessionsDTO } from './dto';
import { goalWithSessionsMapper } from './mappers';
import type { GoalWithSessions } from './models';

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
