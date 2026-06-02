export type GoalDTO = {
  id: string;
  student_id: number;
  title: string;
  description?: string;
  goal_type?: string;
  rating?: number;
  goal_tags?: string[];
  start_date?: string | null;
  end_date?: string | null;
  created_at: string;
  updated_at: string;
};
