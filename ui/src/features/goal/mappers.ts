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
