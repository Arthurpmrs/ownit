import Header from '@/features/appshell/header';
import {
  Alert,
  Anchor,
  Button,
  Center,
  Container,
  Flex,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
} from '@mantine/core';
import {
  IconCalendar,
  IconClock,
  IconSchool,
  IconTarget,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link as TRLink } from '@tanstack/react-router';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { getStudySessionOptions } from '../api';
import { SessionChecklist } from './checklist';
import { Pomodoro } from './pomodoro';
import EvaluateSessionModal from '@/features/goal/components/evaluate-session-modal';
import { SessionNotes } from './session-notes';

export default function SessionExecution() {
  const { id } = useParams({ from: '/sessions/$id' });
  const { data, isLoading, error } = useQuery(getStudySessionOptions(id));

  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);
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
          <>
            <Text component="span" inherit lineClamp={3}>
              {studySession.description || 'Detalhes da sessão de estudo'}
            </Text>
            <Group gap="lg" mt={4}>
              <Flex align="center" gap={6}>
                <IconTarget size={14} color="#868E96" stroke={2} />
                <Text component="span" size="xs" c="dimmed">
                  <Anchor
                    component={TRLink}
                    to="/goals/$id"
                    params={{ id: studySession.goalId }}
                    c="gray"
                    underline="always"
                    {...({} as any)}
                  >
                    {studySession.goalTitle}
                  </Anchor>
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
          </>
        }
        icon={<IconSchool stroke={2} color="white" size={32} />}
      >
        <Button
          variant="outline"
          color="orange"
          disabled={isFinished}
          onClick={() => setIsEvaluationModalOpen(true)}
        >
          Finalizar Sessão
        </Button>
      </Header>
      <EvaluateSessionModal
        isOpen={isEvaluationModalOpen}
        setIsOpen={setIsEvaluationModalOpen}
        goalId={studySession.goalId}
        session={studySession}
      />

      <Grid py="xl" px="xl" gap="xl">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="xl" h="100%">
            <SessionNotes
              sessionId={studySession.id}
              initialNotes={studySession.notes}
            />

            {/* <Stack gap="sm">
              <Title order={4}>Histórico de eventos</Title>
              <p>historico de eventos</p>
            </Stack>

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
            </Stack> */}
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
              sessionStatus={studySession.status}
            />
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}
