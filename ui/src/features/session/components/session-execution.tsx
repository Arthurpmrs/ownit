import Header from '@/features/appshell/header';
import { useUpdateStudySessionStatus } from '@/features/goal/hooks';
import {
  Alert,
  Button,
  Center,
  Container,
  Flex,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import {
  IconCalendar,
  IconClock,
  IconSchool,
  IconTarget,
} from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { getStudySessionOptions } from '../api';
import { SessionChecklist } from './checklist';
import { Pomodoro } from './pomodoro';
import { SessionNotes } from './session-notes';

export default function SessionExecution() {
  const { id } = useParams({ from: '/sessions/$id' });
  const { data, isLoading, error } = useQuery(getStudySessionOptions(id));

  const [comment, setComment] = useState('');

  const isFinished = data?.studySession.status === 'done';

  const queryClient = useQueryClient();
  const updateStatus = useUpdateStudySessionStatus(
    data?.studySession.goalId ?? '',
  );

  const handleFinishSession = () => {
    if (!data) {
      return;
    }
    const { studySession } = data;
    updateStatus.mutate(
      {
        sessionId: studySession.id,
        currentStatus: studySession.status,
        newStatus: 'done',
      },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({
            queryKey: getStudySessionOptions(id).queryKey,
          }),
      },
    );
  };

  const handleAddComment = () => {
    if (!comment.trim()) {
      return;
    }
    setComment('');
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Container py="xl">
        <Alert title="Erro ao carregar sessão" color="red">
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Alert>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container py="xl">
        <Alert title="Sessão não encontrada" color="yellow">
          A sessão solicitada não existe.
        </Alert>
      </Container>
    );
  }

  const { studySession } = data;

  const formatDate = (date: Date) =>
    date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const dateRange = `${formatDate(studySession.plannedToStartAt)} - ${formatDate(studySession.plannedToEndAt)}`;

  return (
    <>
      <Header
        title={studySession.title}
        description={
          <Group gap="lg" mt={4}>
            <Flex align="center" gap={6}>
              <IconTarget size={14} color="#868E96" stroke={2} />
              <Text component="span" size="xs" c="dimmed">
                {studySession.goalTitle}
              </Text>
            </Flex>
            <Flex align="center" gap={6}>
              <IconCalendar size={14} color="#868E96" stroke={2} />
              <Text component="span" size="xs" c="dimmed">
                {dateRange}
              </Text>
            </Flex>
            <Flex align="center" gap={6}>
              <IconClock size={14} color="#868E96" stroke={2} />
              <Text component="span" size="xs" c="dimmed">
                {studySession.duration}
              </Text>
            </Flex>
          </Group>
        }
        icon={<IconSchool stroke={2} color="white" size={32} />}
      >
        <Button
          variant="outline"
          color="orange"
          disabled={isFinished}
          loading={updateStatus.isPending}
          onClick={handleFinishSession}
        >
          Finalizar Sessão
        </Button>
      </Header>

      <Grid py="xl" px="xl" gap="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="xl">
            <SessionNotes
              sessionId={studySession.id}
              initialNotes={studySession.notes}
            />

            <Stack gap="sm">
              <Title order={4}>Histórico de eventos</Title>
              <p>historico de eventos</p>
            </Stack>

            {/* Comentários */}
            <Stack gap="sm">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.currentTarget.value)}
                placeholder="Escreva comentários para ajuda nos seus próximos planejamentos"
                minRows={3}
                autosize
                disabled={isFinished}
                styles={{ input: { backgroundColor: 'white' } }}
              />
              <Flex justify="flex-end">
                <Button
                  color="orange"
                  onClick={handleAddComment}
                  disabled={isFinished}
                >
                  Adicionar comentário
                </Button>
              </Flex>
            </Stack>
          </Stack>
        </Grid.Col>

        {/* Pomodoro + Checklist */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            <Pomodoro
              sessionId={studySession.id}
              sessionDuration={studySession.duration}
              pomodoro={studySession.pomodoro}
            />

            <SessionChecklist
              sessionId={studySession.id}
              initialChecklist={studySession.checklist}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}
