export type Goal = {
  id: string;
  studentId: number;
  title: string;
  description: string;
  goal_tags: string[];
  created_at: Date;
  updated_at: Date;
  start_date: Date | null;
  end_date: Date | null;
};

export type CreateGoalData = {
  student_id: number;
  title: string;
  description?: string;
  goal_tags?: string[];
  start_date: Date | null;
  end_date: Date | null;
};
