import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ActionIcon,
  Avatar,
  Box,
  CloseButton,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Text,
  TextInput,
} from '@mantine/core';
import {
  ArrowsClockwiseIcon,
  PaperPlaneRightIcon,
} from '@phosphor-icons/react';
import { chatQueryOptions, createSession } from '../api';
import { useChatStream } from '../hooks';
import ChatBubble from './ChatBubble';

interface ChatWindowProps {
  onClose: () => void;
  style?: React.CSSProperties;
}

export default function ChatWindow({ onClose, style }: ChatWindowProps) {
  const [input, setInput] = useState('');
  const viewportRef = useRef<HTMLDivElement>(null);
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

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const content = input.trim();

    if (!content || streamMutation.isPending) {
      return;
    }

    try {
      let currentSessionId = session?.id;
      if (!currentSessionId) {
        const newSession = await createSessionMutation.mutateAsync();
        currentSessionId = newSession.id;
      }

      setInput('');
      streamMutation.mutate({ sessionId: currentSessionId, content });
    } catch (error) {
      console.error('Failed to start chat session', error);
      // Input is preserved if creation fails
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (viewportRef.current) {
      viewportRef.current.scrollTo({
        top: viewportRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages]);

  const handleNewSession = async () => {
    await createSessionMutation.mutateAsync();
    setInput('');
  };

  return (
    <Paper
      shadow="xl"
      radius="md"
      withBorder
      w={380}
      h={500}
      style={{
        ...style,
        overflow: 'hidden',
      }}
    >
      <Flex direction="column" h="100%">
        {/* Header */}
        <Box
          bg="white"
          p="md"
          style={{
            borderBottom: '1px solid var(--mantine-color-borderLight-0)',
          }}
        >
          <Group justify="space-between">
            <Group gap="sm">
              <Avatar size={32} radius="md" color="orange.6" variant="filled">
                <img
                  src="/favicon.svg"
                  style={{
                    width: '70%',
                    height: '70%',
                    objectFit: 'contain',
                  }}
                  alt=""
                />
              </Avatar>
              <Text fw={600}>James</Text>
            </Group>
            <Group gap="xs">
              <ActionIcon
                variant="transparent"
                color="gray"
                onClick={handleNewSession}
                title="New Chat Session"
              >
                <ArrowsClockwiseIcon size={20} />
              </ActionIcon>
              <CloseButton
                variant="transparent"
                color="gray"
                iconSize={20}
                onClick={onClose}
              />
            </Group>
          </Group>
        </Box>

        {/* Messages List */}
        <ScrollArea flex={1} p="md" viewportRef={viewportRef}>
          {isLoading && (
            <Text c="dimmed" ta="center" mt="xl">
              Loading...
            </Text>
          )}
          {messages?.map((msg) => (
            <ChatBubble key={msg.id} message={msg} />
          ))}
          {!isLoading && messages?.length === 0 && (
            <Text c="dimmed" ta="center" mt="xl">
              Hello! I'm James, your AI study assistant. How can I help you
              today?
            </Text>
          )}
        </ScrollArea>

        {/* Input Area */}
        <Box
          p="md"
          style={{
            borderTop: '1px solid var(--mantine-color-borderLight-0)',
          }}
        >
          <form onSubmit={handleSend}>
            <TextInput
              placeholder="Ask James something..."
              value={input}
              onChange={(e) => setInput(e.currentTarget.value)}
              disabled={streamMutation.isPending}
              rightSection={
                <ActionIcon
                  type="submit"
                  variant="filled"
                  color="orange"
                  disabled={!input.trim() || streamMutation.isPending}
                >
                  <PaperPlaneRightIcon size={18} />
                </ActionIcon>
              }
            />
          </form>
        </Box>
      </Flex>
    </Paper>
  );
}
