import { formatDuration, parseDate, parseDuration } from '@/shared/utils';
import type {
  EventDTO,
  GoalWithSessionsDTO,
  PomodoroDTO,
  StrategyAdherenceMetricDTO,
  MetricsDTO,
  StudySessionDTO,
  StudySessionShortDTO,
  StudySessionWithHistoryDTO,
  SRWeeklyMetricDTO,
  PerformanceSummaryDTO,
} from './dto';
import type {
  GoalWithSessions,
  PerformanceSummary,
  Pomodoro,
  SRWeeklyMetric,
  StrategyAdherenceMetric,
  StrategyMetricsData,
  StudySession,
  StudySessionShort,
} from './models';
import { goalMapper } from '../goals/mappers';
import { studySessionShortMapper } from '../session/mapper';
import type { GoalWithSessionsDTO } from './dto';
import type { GoalWithSessions } from './models';

export const goalWithSessionsMapper = {
  fromDTO(dto: GoalWithSessionsDTO): GoalWithSessions {
    return {
      goal: goalMapper.fromDTO(dto.goal),
      sessions: studySessionShortMapper.fromDTOList(dto.sessions),
    };
  },

  fromDTOList(dtos: GoalWithSessionsDTO[]): GoalWithSessions[] {
    return dtos.map((dto) => this.fromDTO(dto));
  },
};

export const strategyAdherenceMetricMapper = {
  fromDTO(dto: StrategyAdherenceMetricDTO): StrategyAdherenceMetric {
    return {
      strategy: dto.strategy,
      adherence: dto.adherence,
      sessionsCount: dto.sessions_count,
    };
  },
};

export const performanceSummaryMapper = {
  fromDTO(dto: PerformanceSummaryDTO): PerformanceSummary {
    return {
      totalDurationInHours: formatDuration(dto.total_duration),
      avgSessionDuratioInHours: formatDuration(dto.avg_session_duration),
      avgRating: dto.avg_rating,
      sessionsCount: dto.sessions_count,
    };
  },
};

export const srWeeklyMapper = {
  fromDTO(dto: SRWeeklyMetricDTO): SRWeeklyMetric {
    return {
      week: dto.week,
      weekStart: parseDate(dto.week_start),
      weekEnd: parseDate(dto.week_end),
      srCount: dto.sr_count,
      avgRating: dto.avg_rating,
      avgDomainPerception: dto.avg_domain_perception,
      finishedCount: dto.finished_count,
      frequency: dto.frequency,
    };
  },
};

export const metricsMapper = {
  fromDTO(dto: MetricsDTO): StrategyMetricsData {
    return {
      goalId: dto.goal_id,
      strategyAdherence: dto.strategy_adherence.map((m) =>
        strategyAdherenceMetricMapper.fromDTO(m),
      ),
      srWeekly: dto.sr_weekly.map((m) => srWeeklyMapper.fromDTO(m)),
      performanceSummary: performanceSummaryMapper.fromDTO(
        dto.performance_summary,
      ),
    };
  },
};

export const studySessionStrategyMap = {
  VIDEO: 'Vídeos',
  READING: 'Leitura',
  PRACTICE: 'Prática',
  FLASHCARDS: 'Flashcards',
  MIND_MAP: 'Mapa Mental',
  FEYNMAN: 'Técnica de Feynman',
  SELF_EXPLANATION: 'Auto explicação',
};
