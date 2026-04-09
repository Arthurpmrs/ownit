import type { GoalDTO } from './dto';
import type { Goal } from './models';

/**
 * Mapper para transformar GoalDTO (dados do backend) em Goal (modelo de domínio)
 *
 * Responsabilidades:
 * - Converter snake_case para camelCase
 * - Converter strings de data para objetos Date
 * - Tratar valores opcionais e defaults
 */
export const goalMapper = {
  fromDTO(dto: GoalDTO): Goal {
    return {
      id: dto.id,
      studentId: dto.student_id,
      title: dto.title,
      description: dto.description ?? '',
      goalType: dto.goal_type,
      rating: dto.rating,
      created_at: new Date(dto.created_at),
      updated_at: new Date(dto.updated_at),
    };
  },
  fromDTOList(dtos: GoalDTO[]): Goal[] {
    return dtos.map((dto) => this.fromDTO(dto));
  },
};
