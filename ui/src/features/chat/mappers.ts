import type { ChatMessageDto, ChatSessionDto } from './dto';
import type { ChatMessage, ChatSession } from './models';

export function mapChatSession(dto: ChatSessionDto): ChatSession {
  return {
    id: dto.id,
    studentId: dto.student_id,
    title: dto.title,
    createdAt: dto.created_at,
    updatedAt: dto.updated_at,
  };
}

export function mapChatMessage(dto: ChatMessageDto): ChatMessage {
  return {
    id: dto.id,
    sessionId: dto.session_id,
    role: dto.role,
    content: dto.content,
    createdAt: dto.created_at,
  };
}
