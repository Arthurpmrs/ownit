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
export type UpdateStudySessionData = {
  sessionId: string;
  title?: string;
  description?: string;
  planned_to_start_at?: Date | null;
  duration?: string;
};

export type EvaluateSessionData = {
  sessionId: string;
  rating: number;
  domain_perception_level: number;
  learning_difficulty_level: number;
  strategies: string[];
  final_comment: string;
};

export type StrategyAdherenceMetric = {
  strategy: string;
  adherence: number;
  sessionsCount: number;
};

export type PerformanceSummary = {
  totalDurationInHours: string;
  avgSessionDuratioInHours: string;
  avgRating: number;
  sessionsCount: number;
};

export type SRWeeklyMetric = {
  week: number;
  weekStart: Date;
  weekEnd: Date;
  srCount: number;
  finishedCount: number;
  avgRating: number;
  avgDomainPerception: number;
  frequency: number;
};

export type StrategyMetricsData = {
  goalId: string;
  strategyAdherence: StrategyAdherenceMetric[];
  srWeekly: SRWeeklyMetric[];
  performanceSummary: PerformanceSummary;
};
