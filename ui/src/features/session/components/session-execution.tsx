import Header from '@/features/appshell/header';
import EvaluateSessionModal from '@/features/goal/components/evaluate-session-modal';
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
import { Link as TRLink, useParams } from '@tanstack/react-router';
import { useState } from 'react';
import { getStudySessionOptions } from '../api';
import { SessionChecklist } from './checklist';
import { Pomodoro } from './pomodoro';
import { SessionNotes } from './session-notes';

export default function SessionExecution() {
  const { id } = useParams({ from: '/sessions/$id' });
  const { data, isLoading, error } = useQuery(getStudySessionOptions(id));

  const [isEvaluationModalOpen, setIsEvaluationModalOpen] = useState(false);

  const isFinished = data?.studySession.status === 'done';

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
              sessionStatus={studySession.status}
            />
          </Stack>
        </Grid.Col>

        {/* Pomodoro + Checklist */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            <Pomodoro
              sessionId={studySession.id}
              sessionDuration={studySession.duration}
              pomodoro={studySession.pomodoro}
              sessionStatus={studySession.status}
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
