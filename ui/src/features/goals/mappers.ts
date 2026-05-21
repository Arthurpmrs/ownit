import type { GoalDTO } from './dto';
import type { Goal, Status } from './models';

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

export function statusMapper(status: Status): string {
  switch (status) {
    case 'to_do':
      return 'Pendente';
    case 'doing':
      return 'Em andamento';
    case 'done':
      return 'Concluído';
    case 'canceled':
      return 'Cancelado';
  }
}
