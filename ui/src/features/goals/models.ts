export type Goal = {
  id: string;
  studentId: number;
  title: string;
  description: string;
  status: Status;
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

export type SessionStatus = 'active' | 'pending' | 'completed';

export type Session = {
  id: string;
  goalId: string;
  title: string;
  description: string;
  status: SessionStatus;
  date_range: [Date | null, Date | null];
  duration: number; // em minutos
  duration_focused: number; // em minutos
  duration_paused: number; // em minutos
};
export type Status = 'to_do' | 'doing' | 'done' | 'canceled';
