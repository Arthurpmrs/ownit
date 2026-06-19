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

export const studySessionShortMapper = {
  fromDTO(dto: StudySessionShortDTO): StudySessionShort {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      status: dto.status,
      plannedToStartAt: parseDate(dto.planned_to_start_at),
      plannedToEndAt: parseDate(dto.planned_to_end_at),
      duration: parseDuration(dto.duration),
    };
  },
  fromDTOList(dtos: StudySessionShortDTO[]): StudySessionShort[] {
    return dtos.map((dto) => this.fromDTO(dto));
  },
};

export const studySessionMapper = {
  fromDTO(dto: StudySessionDTO): StudySession {
    return {
      id: dto.id,
      title: dto.title,
      description: dto.description,
      status: dto.status,

      plannedToStartAt: parseDate(dto.planned_to_start_at),
      plannedToEndAt: parseDate(dto.planned_to_end_at),
      duration: parseDuration(dto.duration),

      studentId: dto.student_id,
      goalId: dto.goal_id,
      goalTitle: dto.goal_title,

      notes: dto.notes,

      pomodoro: dto.pomodoro ? pomodoroMapper.fromDTO(dto.pomodoro) : null,

      rating: dto.rating,
      domainPerceptionLevel: dto.domain_perception_level,
      learningDifficultyLevel: dto.learning_difficulty_level,

      strategies: dto.strategies,
      finalComment: dto.final_comment,

      createdAt: parseDate(dto.created_at),
      updatedAt: parseDate(dto.updated_at),
    };
  },
};

export const sessionEventMapper = {
  fromDTO(dto: EventDTO) {
    return {
      studentId: dto.student_id,
      timestamp: parseDate(dto.timestamp),
      context: dto.context,
      type: dto.type,
    };
  },
};

export const studySessionWithHistoryMapper = {
  fromDTO(dto: StudySessionWithHistoryDTO) {
    return {
      studySession: studySessionMapper.fromDTO(dto.study_session),
      history: dto.history.map((e) => sessionEventMapper.fromDTO(e)),
    };
  },
};

export const pomodoroMapper = {
  fromDTO(dto: PomodoroDTO): Pomodoro {
    return {
      id: dto.id,
      studySessionId: dto.study_session_id,
      status: dto.status,
      currentStartedAt: parseDate(dto.current_started_at),
      currentRemainingDuration: parseDuration(dto.current_remaining_duration),
      focusDuration: parseDuration(dto.focus_duration),
      breakDuration: parseDuration(dto.break_duration),
      createdAt: parseDate(dto.created_at),
      updatedAt: parseDate(dto.updated_at),
    };
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
