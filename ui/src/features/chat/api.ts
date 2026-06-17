import { queryOptions } from '@tanstack/react-query';
import type { ChatSessionDto, ChatMessageDto } from './dto';
import { mapChatSession, mapChatMessage } from './mappers';
import type { ChatSession, ChatMessage } from './models';

const API_URL = import.meta.env.VITE_API_URL;

export async function fetchActiveSession(): Promise<ChatSession | null> {
  const response = await fetch(`${API_URL}/chat/sessions/active`, {
    credentials: 'include',
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error('Failed to fetch active chat session');
  }

  const dto: ChatSessionDto = await response.json();
  return mapChatSession(dto);
}

export async function createSession(): Promise<ChatSession> {
  const response = await fetch(`${API_URL}/chat/sessions`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Failed to create chat session');
  }

  const dto: ChatSessionDto = await response.json();
  return mapChatSession(dto);
}

export async function fetchSessionMessages(
  sessionId: string,
): Promise<ChatMessage[]> {
  const response = await fetch(
    `${API_URL}/chat/sessions/${sessionId}/messages`,
    {
      credentials: 'include',
    },
  );

  if (!response.ok) {
    throw new Error('Failed to fetch session messages');
  }

  const dtos: ChatMessageDto[] = await response.json();
  return dtos.map(mapChatMessage);
}

export const chatQueryOptions = {
  activeSession: () =>
    queryOptions({
      queryKey: ['chat', 'activeSession'],
      queryFn: fetchActiveSession,
    }),
  sessionMessages: (sessionId: string | undefined) =>
    queryOptions({
      queryKey: ['chat', 'messages', sessionId],
      queryFn: () =>
        sessionId ? fetchSessionMessages(sessionId) : Promise.resolve([]),
      enabled: !!sessionId,
    }),
};
