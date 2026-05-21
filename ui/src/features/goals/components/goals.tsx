import {
  Alert,
  Badge,
  Card,
  Center,
  Container,
  Group,
  Loader,
  Stack,
  Text,
} from '@mantine/core';
import { useQuery } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';

import { getStudentGoalsOptions } from '../api';
import type { Goal } from '../models';
import CreateGoalModal from './create-goal-modal';
import FilterGoalsModal from './filter-goals-modal';

export default function Goals() {
  const { student } = useRouteContext({ from: '/goals/' });

  const {
    data: goals,
    isLoading,
    error,
  } = useQuery(getStudentGoalsOptions(student.id));

  return (
    <Container py="xl">
      <Group justify="space-between" mb="lg">
        <Text size="xl" fw={700}>
          Minhas Metas
        </Text>
        <Group>
          <FilterGoalsModal />
          <CreateGoalModal
            studentId={student.id}
            disabled={isLoading || error !== null}
          />
        </Group>
      </Group>

      <GoalsList goals={goals} isLoading={isLoading} error={error} />
    </Container>
  );
}

interface GoalListProps {
  goals?: Goal[];
  isLoading: boolean;
  error: Error | null;
}

function GoalsList({ goals, isLoading, error }: GoalListProps) {
  if (goals === undefined && isLoading) {
    return (
      <Center>
        <Loader />
      </Center>
    );
  }

  if (error) {
    return (
      <Alert title="Erro ao carregar metas" color="red" mb="lg">
        {error instanceof Error ? error.message : 'Erro desconhecido'}
      </Alert>
    );
  }

  return (
    <Stack gap="md">
      {goals && goals.length > 0 ? (
        goals.map((goal) => (
          <Card key={goal.id} padding="lg" radius="md" withBorder>
            <Card.Section withBorder inheritPadding py="md">
              <Group justify="space-between">
                <Text fw={600} size="lg">
                  {goal.title}
                </Text>
                <Badge color="blue" variant="light">
                  {goal.goalType}
                </Badge>
              </Group>
            </Card.Section>

            <Card.Section inheritPadding py="md">
              {goal.description && (
                <Text size="sm" c="dimmed" mb="md">
                  {goal.description}
                </Text>
              )}
              <Group justify="space-between">
                <Text size="sm">
                  <strong>Avaliação:</strong> {goal.rating}/10
                </Text>
                <Text size="xs" c="dimmed">
                  Atualizado: {goal.updated_at.toLocaleDateString('pt-BR')}
                </Text>
              </Group>
            </Card.Section>
          </Card>
        ))
      ) : (
        <Center py="lg">
          <Text c="dimmed">Nenhuma meta criada ainda</Text>
        </Center>
      )}
    </Stack>
  );
}
