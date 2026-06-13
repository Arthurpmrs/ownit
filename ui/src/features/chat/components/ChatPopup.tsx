import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
  ActionIcon,
  Affix,
  Avatar,
  Box,
  CloseButton,
  Flex,
  Group,
  Paper,
  ScrollArea,
  Text,
  TextInput,
  Transition,
} from '@mantine/core';
import { ArrowsClockwiseIcon, PaperPlaneRightIcon } from '@phosphor-icons/react';
import { chatQueryOptions, createSession } from '../api';
import { useChatStream } from '../hooks';
import ChatBubble from './ChatBubble';

export default function ChatPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const viewportRef = useRef<HTMLDivElement>(null);

  const { data: session, refetch: refetchSession } = useQuery(
    chatQueryOptions.activeSession(),
  );
  const { data: messages } = useQuery(
    chatQueryOptions.sessionMessages(session?.id),
  );

  const createSessionMutation = useMutation({
    mutationFn: createSession,
    onSuccess: () => refetchSession(),
  });

  const streamMutation = useChatStream();

  const handleSend = async () => {
    if (!input.trim() || streamMutation.isPending) {
      return;
    }

    const content = input;
    setInput('');

    let currentSessionId = session?.id;
    if (!currentSessionId) {
      const newSession = await createSessionMutation.mutateAsync();
      currentSessionId = newSession.id;
    }

    streamMutation.mutate({ sessionId: currentSessionId, content });
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
  };

  return (
    <Affix position={{ bottom: 20, right: 20 }} zIndex={100}>
      <Flex direction="column" align="flex-end" gap="sm">
        <Transition transition="slide-up" mounted={isOpen}>
          {(transitionStyles) => (
            <Paper
              shadow="xl"
              radius="md"
              withBorder
              style={{
                ...transitionStyles,
                width: 380,
                height: 500,
                overflow: 'hidden',
              }}
            >
              <Flex direction="column" h="100%">
                {/* Header */}
                <Box
                  bg="white"
                  p="md"
                  style={{
                    borderBottom:
                      '1px solid var(--mantine-color-borderLight-0)',
                  }}
                >
                  <Group justify="space-between">
                    <Group gap="sm">
                      <Avatar
                        size={32}
                        radius="md"
                        color="orange.6"
                        variant="filled"
                      >
                        <img
                          src="/favicon.svg"
                          style={{
                            width: '70%',
                            height: '70%',
                            objectFit: 'contain',
                          }}
                          alt="James"
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
                        onClick={() => setIsOpen(false)}
                      />
                    </Group>
                  </Group>
                </Box>

                {/* Messages List */}
                <ScrollArea flex={1} p="md" viewportRef={viewportRef}>
                  {messages?.map((msg) => (
                    <ChatBubble key={msg.id} message={msg} />
                  ))}
                  {messages?.length === 0 && (
                    <Text c="dimmed" ta="center" mt="xl">
                      Hello! I'm James, your AI study assistant. How can I help
                      you today?
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
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSend();
                    }}
                  >
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
          )}
        </Transition>

        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color="orange"
          onClick={() => setIsOpen(!isOpen)}
          style={{
            width: 60,
            height: 60,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          <img src="/favicon.svg" width={32} height={32} alt="Chat" />
        </ActionIcon>
      </Flex>
    </Affix>
  );
}
