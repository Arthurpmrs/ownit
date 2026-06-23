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

export type StrategyAdherenceMetricDTO = {
  strategy: string;
  adherence: number;
  sessions_count: number;
};

export type SRWeeklyMetricDTO = {
  week: number;
  week_start: string;
  week_end: string;
  sr_count: number;
  finished_count: number;
  avg_rating: number;
  avg_domain_perception: number;
  frequency: number;
};

export type PerformanceSummaryDTO = {
  total_duration: number;
  avg_session_duration: number;
  avg_rating: number;
  sessions_count: number;
};

export type MetricsDTO = {
  goal_id: string;
  performance_summary: PerformanceSummaryDTO;
  strategy_adherence: StrategyAdherenceMetricDTO[];
  sr_weekly: SRWeeklyMetricDTO[];
};
