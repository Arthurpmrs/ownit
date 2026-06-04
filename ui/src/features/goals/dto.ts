import type { Status } from '@/shared/models';

export type GoalDTO = {
  id: string;
  student_id: number;
  title: string;
  description?: string;
  goal_tags: string[];
  status: Status;
  start_date: string;
  end_date: string;
  created_at: string;
  updated_at: string;
};
