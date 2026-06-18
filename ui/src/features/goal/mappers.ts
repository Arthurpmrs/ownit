import { parseDate, parseDuration } from '@/shared/utils';
import type {
  EventDTO,
  GoalWithSessionsDTO,
  PomodoroDTO,
  StrategyMetricDTO,
  StrategyMetricsResponseDTO,
  StudySessionDTO,
  StudySessionShortDTO,
  StudySessionWithHistoryDTO,
} from './dto';
import type {
  GoalWithSessions,
  Pomodoro,
  StrategyMetric,
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

export const strategyMetricMapper = {
  fromDTO(dto: StrategyMetricDTO): StrategyMetric {
    return {
      strategy: dto.strategy,
      adherence: dto.adherence,
      sessionsCount: dto.sessions_count,
    };
  },
};

export const strategyMetricsMapper = {
  fromDTO(dto: StrategyMetricsResponseDTO): StrategyMetricsData {
    return {
      goalId: dto.goal_id,
      metrics: dto.strategy_metrics.map((m) => strategyMetricMapper.fromDTO(m)),
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
  SELF_EXPLANATION: 'Autoexplicação',
};
