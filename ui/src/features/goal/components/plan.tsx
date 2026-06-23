import Header from '@/features/appshell/header';
import {
  Alert,
  Button,
  Badge,
  Center,
  Container,
  Flex,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import SessionKanban from './session-kanban';
import SessionPerformance from './session-performance';
import { useUpdateGoalStatus } from '../hooks';

import { getGoalOptions } from '@/features/goal/api';
import { IconBook, IconCalendar, IconTag } from '@tabler/icons-react';
import type { Status } from '@/shared/models';

export default function Plan() {
  const { id } = useParams({ from: '/goals/$id' });
  const { data, isLoading, error } = useQuery(getGoalOptions(id));
  const { mutate: startPlan, isPending } = useUpdateGoalStatus(
    id,
    data?.goal.studentId,
  );

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

  if (!data) {
    return (
      <Container py="xl">
        <Alert title="Plano não encontrado" color="yellow">
          O plano solicitado não existe.
        </Alert>
      </Container>
    );
  }

  const { goal, sessions } = data;

  const totalSessions = sessions.length;
  const completedSessions = sessions.filter((s) => s.status === 'done').length;
  const progressPercentage =
    totalSessions === 0
      ? 0
      : Math.round((completedSessions / totalSessions) * 100);

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) {
      return null;
    }
    const dateObj =
      typeof date === 'string'
        ? new Date(date.replace(/-/g, '/'))
        : new Date(date);
    return dateObj.toLocaleDateString('pt-BR');
  };

  const startDate = formatDate(goal.start_date);
  const endDate = formatDate(goal.end_date);
  const dateRangeText = [startDate, endDate].filter(Boolean).join(' - ');
  const tags = goal.goal_tags;

  const STATUS_LABEL: Record<Status, string> = {
    to_do: 'A Fazer',
    doing: 'Em Andamento',
    done: 'Concluído',
    canceled: 'Cancelado',
  };

  const STATUS_COLOR: Record<Status, string> = {
    to_do: 'gray',
    doing: 'blue',
    done: 'green',
    canceled: 'red',
  };

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
              <Badge color={STATUS_COLOR[goal.status]}>
                {STATUS_LABEL[goal.status]}
              </Badge>
              {dateRangeText && (
                <Flex align="center" gap={6}>
                  <IconCalendar size={16} color="#868E96" stroke={2} />
                  <Text component="span" size="xs" c="dimmed" fw={400}>
                    {dateRangeText}
                  </Text>
                </Flex>
              )}
              <Flex align="center" gap={6}>
                <IconTag size={16} color="#868E96" stroke={2} />
                <Text>{tags.length > 0 ? tags.join(', ') : 'Não há tags'}</Text>
              </Flex>
            </Group>
          </>
        }
        icon={<IconBook stroke={2} color="white" size={32} />}
      >
        {goal.status === 'to_do' ? (
          <Button
            color="orange"
            loading={isPending}
            onClick={() => startPlan('doing')}
          >
            Iniciar Plano
          </Button>
        ) : (
          <Group gap="lg">
            <Stack gap={0} align="center">
              <Flex align="baseline">
                <Text fw={500} size="xl">
                  {completedSessions}
                </Text>
                <Text size="xs" c="#868E96">
                  {' '}
                  /{totalSessions}
                </Text>
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
        )}
      </Header>

      <Grid py="xl" px="xl" gap="xl">
        <Grid.Col span={{ base: 12, md: 4 }}>
          <SessionKanban sessions={sessions} goalId={id} goalStatus={goal.status} />
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 8 }}>
          <SessionPerformance goalId={id} />
        </Grid.Col>
      </Grid>
    </>
  );
}
