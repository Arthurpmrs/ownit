import type { PomodoroDTO } from './dto';
import { pomodoroMapper } from './mapper';
import type { Pomodoro } from './models';

export async function updatePomodoroStatus(
  sessionId: string,
): Promise<Pomodoro> {
  const url = `${import.meta.env.VITE_API_URL}/${sessionId}/pomodoro`;
  const response = await fetch(url, { credentials: 'include' });

  if (!response.ok) {
    throw new Error(
      `Falha ao atualizar o status do pomodoro: ${response.status} ${response.statusText}`,
    );
  }

  const dto: PomodoroDTO = await response.json();
  return pomodoroMapper.fromDTO(dto);
}
