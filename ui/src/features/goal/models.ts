import type { Status } from '@/shared/models';
import type { Goal } from '../goals/models';

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

export type StudySessionShort = {
  id: string;
  title: string;
  description: string;
  status: Status;
  plannedToStartAt: Date;
  plannedToEndAt: Date;
  duration: string;
};

export type StudySession = {
  id: string;
  title: string;
  description: string;
  status: Status;
  plannedToStartAt: Date;
  plannedToEndAt: Date;
  duration: string;
  studentId: number;
  goalId: string;
  goalTitle: string;
  notes: string;
  pomodoro: Pomodoro | null;
  rating: number | null;
  domainPerceptionLevel: number | null;
  learningDifficultyLevel: number | null;
  strategies: string[];
  finalComment: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type SessionEvent = {
  studentId: number;
  timestamp: Date;
  context: Record<string, unknown>;
  type: string;
};

export type StudySessionWithHistory = {
  studySession: StudySession;
  history: SessionEvent[];
};

export type Pomodoro = {
  id: number;
  studySessionId: string;
  status: PomodoroStatus;
  currentStartedAt: Date;
  currentRemainingDuration: string;
  focusDuration: string;
  breakDuration: string;
  createdAt: Date;
  updatedAt: Date;
};

export type PomodoroStatus =
  | 'not_started'
  | 'focus_mode'
  | 'focus_pause'
  | 'break_mode'
  | 'break_pause'
  | 'done';

export type EvaluateSessionData = {
  sessionId: string;
  rating: number;
  domain_perception_level: number;
  learning_difficulty_level: number;
  strategies: string[];
  final_comment: string;
};
