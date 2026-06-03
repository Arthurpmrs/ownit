import Header from '@/features/appshell/header';
import { Alert, Center, Container, Flex, Grid, Group, Loader, Stack, Text } from '@mantine/core';
import { BookOpenIcon, CalendarIcon, TagIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { useState } from 'react';
import SessionKanban from './session-kanban';
import SessionPerformance from './session-performance';

import { getGoalByIdOptions } from '../api';
import type { Session } from '../models';
import type { SessionFormValues } from '@/features/goal/components/create-session-modal';

const parseTimeToMinutes = (time: string): number => {
  if (!time) {
    return 0;
  }
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

export default function Plan() {
  const { id } = useParams({ from: '/goals/$id' });
  const { data: goal, isLoading, error } = useQuery(getGoalByIdOptions(id));
  const [sessions, setSessions] = useState<Session[]>([]);

  const handleSessionCreate = (sessionData: SessionFormValues) => {
    const newSession: Session = {
      id: crypto.randomUUID(),
      goalId: id,
      title: sessionData.title,
      description: sessionData.description,
      status: 'pending',
      date_range: [sessionData.planned_date, goal?.end_date ?? null],
      duration: parseTimeToMinutes(sessionData.session_duration),
      duration_focused: parseTimeToMinutes(sessionData.focus_duration),
      duration_paused: parseTimeToMinutes(sessionData.pause_duration),
    };
    setSessions((prev) => [...prev, newSession]);
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
        <Alert title="Erro ao carregar plano" color="red">
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Alert>
      </Container>
    );
  }

  if (!goal) {
    return (
      <Container py="xl">
        <Alert title="Plano não encontrado" color="yellow">
          O plano solicitado não existe.
        </Alert>
      </Container>
    );
  }

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.status === 'completed').length;
  const progressPercentage = totalSessions === 0 ? 0 : Math.round((completedSessions / totalSessions) * 100);

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date){
      return null;
    }
    const dateObj = typeof date === 'string' ? new Date(date.replace(/-/g, '/')) : new Date(date);
    return dateObj.toLocaleDateString('pt-BR');
  };

  const startDate = formatDate(goal.start_date);
  const endDate = formatDate(goal.end_date);
  const dateRangeText = [startDate, endDate].filter(Boolean).join(' - ');
  const tags = goal.goal_tags;

  return (
    <>
      <Header
        title={goal.title}
        description={
          <>
            <Text component="span" inherit>
              {goal.description || 'Detalhes da sessão de estudo'}
            </Text>
            <Group gap="lg" mt={8}>
              {dateRangeText && (
                <Flex align="center" gap={6}>
                  <CalendarIcon size={16} color="#868E96" weight="bold"/>
                  <Text component="span" size="xs" c="dimmed" fw={400}>
                    {dateRangeText}
                  </Text>
                </Flex>
              )}
              <Flex align="center" gap={6}>
                <TagIcon size={16} color="#868E96" weight="bold"/>
                <Text>{tags.join(', ')}</Text>
              </Flex>
            </Group>
          </>
        }
        icon={<BookOpenIcon weight="bold" color="white" size={32} />}
      >
        <Group gap="lg">
          <Stack gap={0} align="center">
            <Flex align="center">
              <Text fw={500} size="xl">
                {completedSessions}
              </Text>
              <Text size="sm" c="#868E96"> /{totalSessions}</Text>
            </Flex>
            <Text size="sm" opacity={0.8} c="#868E96">
              Sessões
            </Text>
          </Stack>
          <Stack gap={0} align="center">
            <Text fw={500} size="xl" c="#FD7E14">
              {progressPercentage}%
            </Text>
            <Text size="sm" opacity={0.8} c="#868E96">
              Progresso
            </Text>
          </Stack>
        </Group>
      </Header>

      <Grid py="xl" px="xl" gap="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <SessionKanban sessions={sessions} onSessionCreate={handleSessionCreate} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <SessionPerformance />
        </Grid.Col>
      </Grid>
    </>
  );
}
