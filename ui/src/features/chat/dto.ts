export interface ChatSessionDto {
  id: string;
  student_id: number;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageDto {
  id?: string;
  session_id?: string;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}
