import { Avatar, Box, Flex, Text } from '@mantine/core';
import ReactMarkdown from 'react-markdown';
import type { ChatMessage } from '../models';

interface ChatBubbleProps {
  message: ChatMessage;
}

export default function ChatBubble({ message }: ChatBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <Flex
      direction={isUser ? 'row-reverse' : 'row'}
      align="flex-end"
      gap="sm"
      mb="md"
    >
      {!isUser && (
        <Avatar size="md" radius="xl" color="blue">
          🐴
        </Avatar>
      )}

      <Box
        maw="80%"
        p="md"
        bg={isUser ? 'blue.6' : 'gray.1'}
        c={isUser ? 'white' : 'black'}
        style={{
          borderRadius: 16,
          borderBottomRightRadius: isUser ? 4 : 16,
          borderBottomLeftRadius: !isUser ? 4 : 16,
        }}
      >
        {isUser ? (
          <Text size="sm">{message.content}</Text>
        ) : (
          <Box
            style={{
              fontSize: '0.875rem',
              lineHeight: 1.5,
            }}
          >
            <ReactMarkdown>{message.content}</ReactMarkdown>
            {message.isStreaming && (
              <Text component="span" c="dimmed" size="xs">
                {' '}
                █
              </Text>
            )}
          </Box>
        )}
      </Box>
    </Flex>
  );
}
