import type { Goal } from '../goals/models';
import type { StudySessionShort } from '../session/models';

export type GoalWithSessions = {
  goal: Goal;
  sessions: StudySessionShort[];
};

export type CreateStudySessionData = {
  goal_id: string;
  title: string;
  description?: string;
  planned_to_start_at: Date | null;
  duration: string;
  focus_duration: string;
  break_duration: string;
};
