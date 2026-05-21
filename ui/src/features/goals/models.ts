export type Goal = {
  id: string;
  studentId: number;
  title: string;
  description: string;
  goalType: string;
  rating: number;
  created_at: Date;
  updated_at: Date;
};

export type CreateGoalData = {
  student_id: number;
  title: string;
  description?: string;
  goal_type: string;
};

export type Status = 'to_do' | 'doing' | 'done' | 'canceled';
