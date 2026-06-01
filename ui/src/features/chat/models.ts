export interface ChatSession {
  id: string;
  studentId: number;
  title: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChatMessage {
  id?: string;
  sessionId?: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: string;
  isStreaming?: boolean;
}
