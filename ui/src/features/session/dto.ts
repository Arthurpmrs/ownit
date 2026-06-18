import type { Status } from '@/shared/models';
import type { EventDTO } from '../goal/dto';
import type { PomodoroStatus } from './models';

export type StudySessionShortDTO = {
  id: string;
  title: string;
  description: string;
  status: Status;
  planned_to_start_at: string;
  planned_to_end_at: string;
  duration: string;
};

export type StudySessionDTO = StudySessionShortDTO & {
  student_id: number;
  goal_id: string;
  goal_title: string;
  notes: string;
  pomodoro: PomodoroDTO | null;
  rating: number | null;
  domain_perception_level: number | null;
  learning_difficulty_level: number | null;
  strategies: string[];
  final_comment: string | null;
  created_at: string;
  updated_at: string;
};

export type StudySessionWithHistoryDTO = {
  study_session: StudySessionDTO;
  history: EventDTO[];
};

export type PomodoroDTO = {
  id: number;
  study_session_id: string;
  status: PomodoroStatus;
  current_started_at: string;
  current_remaining_duration: string;
  focus_duration: string;
  break_duration: string;
  created_at: string;
  updated_at: string;
};
