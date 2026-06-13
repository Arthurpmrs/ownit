import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { chatQueryOptions, createSession } from './api';
import type { ChatMessage } from './models';

const API_URL = import.meta.env.VITE_API_URL;

interface SendMessageArgs {
  sessionId: string;
  content: string;
}

export function useChatStream() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ sessionId, content }: SendMessageArgs) => {
      // 1. Optimistic update: Add user message
      const userMessage: ChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
      };

      // 2. Optimistic update: Add empty assistant placeholder
      const assistantMessage: ChatMessage = {
        id: 'streaming-placeholder',
        role: 'assistant',
        content: '',
        isStreaming: true,
      };

      queryClient.setQueryData<ChatMessage[]>(
        chatQueryOptions.sessionMessages(sessionId).queryKey,
        (old) =>
          old
            ? [...old, userMessage, assistantMessage]
            : [userMessage, assistantMessage],
      );

      // 3. Initiate the POST request for SSE
      const response = await fetch(
        `${API_URL}/chat/sessions/${sessionId}/messages`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ content }),
        },
      );

      if (!response.ok || !response.body) {
        throw new Error('Failed to send message');
      }

      // 4. Parse the SSE stream natively
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }

          buffer += decoder.decode(value, { stream: true });

          let newlineIndex;
          while ((newlineIndex = buffer.indexOf('\n\n')) >= 0) {
            const chunk = buffer.slice(0, newlineIndex);
            buffer = buffer.slice(newlineIndex + 2);

            let event = 'message';
            let data = '';

            for (const line of chunk.split('\n')) {
              if (line.startsWith('event:')) {
                event = line.slice(6).trim();
              } else if (line.startsWith('data:')) {
                data = line.slice(5).trim();
              }
            }

            if (data) {
              const parsedData = JSON.parse(data);

              if (event === 'token') {
                // Update the placeholder with the new token
                queryClient.setQueryData<ChatMessage[]>(
                  chatQueryOptions.sessionMessages(sessionId).queryKey,
                  (old) => {
                    if (!old) {
                      return old;
                    }
                    const newMessages = [...old];
                    const lastIndex = newMessages.length - 1;
                    if (newMessages[lastIndex].id === 'streaming-placeholder') {
                      newMessages[lastIndex] = {
                        ...newMessages[lastIndex],
                        content:
                          newMessages[lastIndex].content + parsedData.content,
                      };
                    }
                    return newMessages;
                  },
                );
              } else if (event === 'error') {
                throw new Error(parsedData.detail || 'Streaming error');
              } else if (event === 'done') {
                // Done parsing
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
    },
    onSuccess: (_, { sessionId }) => {
      // Invalidate to fetch the true persisted messages (with real DB IDs)
      queryClient.invalidateQueries({
        queryKey: chatQueryOptions.sessionMessages(sessionId).queryKey,
      });
    },
    onError: (error, { sessionId }) => {
      console.error('Chat stream failed:', error);
      // Invalidate to remove any broken optimistic updates
      queryClient.invalidateQueries({
        queryKey: chatQueryOptions.sessionMessages(sessionId).queryKey,
      });
    },
  });
}

export function useChat() {
  const queryClient = useQueryClient();

  const { data: session } = useQuery(chatQueryOptions.activeSession());

  const { data: messages, isLoading } = useQuery({
    ...chatQueryOptions.sessionMessages(session?.id),
    enabled: !!session?.id,
  });

  const createSessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatQueryOptions.activeSession().queryKey,
      });
    },
  });

  const streamMutation = useChatStream();

  const handleNewSession = async () => {
    await createSessionMutation.mutateAsync();
  };

  const sendMessage = async (content: string) => {
    const trimmedContent = content.trim();

    if (!trimmedContent || streamMutation.isPending) {
      return false;
    }

    try {
      let currentSessionId = session?.id;
      if (!currentSessionId) {
        const newSession = await createSessionMutation.mutateAsync();
        currentSessionId = newSession.id;
      }

      streamMutation.mutate({
        sessionId: currentSessionId,
        content: trimmedContent,
      });
      return true;
    } catch (error) {
      console.error('Failed to start chat session', error);
      return false;
    }
  };

  return {
    messages,
    isLoading,
    isPending: streamMutation.isPending,
    sendMessage,
    handleNewSession,
  };
}
