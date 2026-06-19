import { parseDate, parseDuration } from '@/shared/utils';
import type { EventDTO } from '../goal/dto';
import type {
  PomodoroDTO,
  StudySessionDTO,
  StudySessionShortDTO,
  StudySessionWithHistoryDTO,
} from './dto';
import type { Pomodoro, StudySession, StudySessionShort } from './models';

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

      pomodoro: pomodoroMapper.fromDTO(dto.pomodoro),

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
