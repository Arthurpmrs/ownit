import type { GoalDTO } from '../goals/dto';
import type { StudySessionShortDTO } from '../session/dto';

export type GoalWithSessionsDTO = {
  goal: GoalDTO;
  sessions: StudySessionShortDTO[];
};

export type EventDTO = {
  student_id: number;
  timestamp: string;
  context: Record<string, unknown>;
  type: string;
};
