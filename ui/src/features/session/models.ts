import type { Status } from '@/shared/models';

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
  pomodoro: Pomodoro;
  rating: number | null;
  domainPerceptionLevel: number | null;
  learningDifficultyLevel: number | null;
  strategies: string[];
  finalComment: string | null;
  createdAt: Date;
  updatedAt: Date;
  checklist: Array<ChecklistItem>
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
export type EvaluateSessionData = {
  sessionId: string;
  rating: number;
  domain_perception_level: number;
  learning_difficulty_level: number;
  strategies: string[];
  final_comment: string;
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
  history: Array<{ mode: 'focus' | 'break'; duration: number }>;
};

export type PomodoroStatus =
  | 'not_started'
  | 'focus_mode'
  | 'focus_pause'
  | 'break_mode'
  | 'break_pause'
  | 'done';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
}

export interface UpdateChecklistPayload {
  sessionId: string;
  checklist: ChecklistItem[];
}
