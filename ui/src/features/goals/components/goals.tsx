import Header from '@/features/appshell/header';
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
import { TargetIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';
import { useState } from 'react';

import { getStudentGoalsOptions } from '../api';
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
        icon={<TargetIcon weight="bold" color="white" size={32} />}
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

      <Container py="xl">
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
                  {goal.status}
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
                  <strong>Tags:</strong> {goal.goal_tags.join(', ')}
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
          <Text c="dimmed">Nenhum plano criado ainda</Text>
        </Center>
      )}
    </Stack>
  );
}
