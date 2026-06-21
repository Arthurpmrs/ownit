import type { Status } from '@/shared/models';

export type Goal = {
  id: string;
  studentId: number;
  title: string;
  description: string;
  status: Status;
  goal_tags: string[];
  start_date: Date | null;
  end_date: Date | null;
  created_at: Date;
  updated_at: Date;
  progress?: number;
};

export type CreateGoalData = {
  student_id: number;
  title: string;
  description?: string;
  goal_tags?: string[];
  start_date: Date | null;
  end_date: Date | null;
};
