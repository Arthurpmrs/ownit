import Header from '@/features/appshell/header';
import {
  Alert,
  Badge,
  Card,
  Center,
  Container,
  Divider,
  Grid,
  Group,
  Loader,
  Progress,
  Stack,
  Text,
  Title,
} from '@mantine/core';

import { useQuery } from '@tanstack/react-query';
import { useNavigate, useRouteContext } from '@tanstack/react-router';

import { Pomodoro } from '@/features/session/components/pomodoro';
import { IconBook, IconChevronRight, IconTarget } from '@tabler/icons-react';
import { useState } from 'react';
import { getStudentGoalsOptions } from '../api';
import { statusMapper } from '../mappers';
import type { Goal } from '../models';
import CreateGoalModal from './create-goal-modal';
import FilterGoalsModal, { type FilterGoalsValues } from './filter-goals-modal';

export default function Goals() {
  const { student } = useRouteContext({ from: '/goals/' });
  const [filters, setFilters] = useState<FilterGoalsValues | null>(null);

  const {
    data: goals,
    isLoading,
    error,
  } = useQuery(
    getStudentGoalsOptions(
      student.id,
      filters?.status ?? '',
      filters?.goal_tags ?? [],
    ),
  );

  return (
    <>
      <Header
        title="Meus Planos"
        description="Visualize e organize seus planos de estudo"
        icon={<IconTarget stroke={2} color="white" size={32} />}
      >
        <Group gap="sm">
          <FilterGoalsModal
            onFilter={setFilters}
            onClear={() => setFilters(null)}
            isLoading={isLoading}
          />
          <CreateGoalModal
            studentId={student.id}
            disabled={isLoading || error !== null}
          />
        </Group>
      </Header>

      <Container py="xl" mx="xl" fluid>
        <GoalsList goals={goals} isLoading={isLoading} error={error} />
      </Container>
    </>
  );
}

interface GoalListProps {
  goals?: Goal[];
  isLoading: boolean;
  error: Error | null;
}

function GoalsList({ goals, isLoading, error }: GoalListProps) {
  const navigate = useNavigate();
  const [hoveredGoalId, setHoveredGoalId] = useState<string | null>(null);

  function handleClick(id: string) {
    void navigate({ to: '/goals/$id', params: { id } });
  }

  if (goals === undefined && isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert title="Erro ao carregar planos" color="red" mb="lg">
        {error instanceof Error ? error.message : 'Erro desconhecido'}
      </Alert>
    );
  }

  return (
    <Grid gap="md" align="stretch">
      <Pomodoro
        breakDuration="00:05"
        focusDuration="00:10"
        sessionDuration="00:30"
      />
      {goals && goals.length > 0 ? (
        goals.map((goal) => {
          // TODO: Calcular o progresso quando tivermos as sessões
          const mockProgressValue = 0;

          let leftDays = 0;
          if (goal.start_date && goal.end_date) {
            const utcA = Date.UTC(
              goal.start_date.getFullYear(),
              goal.start_date.getMonth(),
              goal.start_date.getDate(),
            );
            const utcB = Date.UTC(
              goal.end_date.getFullYear(),
              goal.end_date.getMonth(),
              goal.end_date.getDate(),
            );
            const msPerDay = 24 * 60 * 60 * 1000;
            leftDays = Math.abs(Math.floor((utcA - utcB) / msPerDay));
          }

          return (
            <Grid.Col span={{ base: 12, md: 3 }} key={goal.id}>
              <Card
                key={goal.id}
                withBorder
                padding="lg"
                radius="md"
                h="100%"
                w="100%"
                shadow={hoveredGoalId === goal.id ? 'lg' : 'md'}
                onClick={() => handleClick(goal.id)}
                onMouseEnter={() => setHoveredGoalId(goal.id)}
                onMouseLeave={() => setHoveredGoalId(null)}
                style={{
                  cursor: 'pointer',
                  transition:
                    'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
                  transform:
                    hoveredGoalId === goal.id ? 'translateY(-4px)' : 'none',
                  borderColor:
                    hoveredGoalId === goal.id
                      ? 'var(--mantine-color-orange-4)'
                      : undefined,
                }}
              >
                <Card.Section inheritPadding py="md" flex={1} h="100%">
                  <Stack gap="md" justify="space-between" h="100%">
                    <Stack gap="sm">
                      <Group justify="space-between">
                        <IconBook size={32} color="orange" stroke={2} />
                        <Badge variant="light">
                          {statusMapper(goal.status)}
                        </Badge>
                      </Group>
                      <Stack gap={0}>
                        <Title order={4} size="lg">
                          {goal.title}
                        </Title>
                        {goal.description && (
                          <Text size="sm" c="dimmed">
                            {goal.description}
                          </Text>
                        )}
                      </Stack>
                    </Stack>

                    <Stack gap="xs">
                      <Stack gap={0}>
                        <Group justify="space-between">
                          <Text c="dimmed" size="sm" fw={600}>
                            Progresso
                          </Text>
                          <Text c="orange" size="lg" fw={600}>
                            {mockProgressValue}%
                          </Text>
                        </Group>
                        <Progress value={mockProgressValue} />
                      </Stack>

                      <Divider />
                      <Group justify="space-between">
                        <Text c="dimmed" size="sm" fw={600}>
                          {leftDays} dias
                        </Text>
                        <IconChevronRight />
                      </Group>
                    </Stack>
                  </Stack>
                </Card.Section>
              </Card>
            </Grid.Col>
          );
        })
      ) : (
        <Center py="lg" w="100%">
          <Text c="dimmed">Nenhum plano criado</Text>
        </Center>
      )}
    </Grid>
  );
}
