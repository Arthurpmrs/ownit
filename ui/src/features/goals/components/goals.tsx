import Header from '@/features/appshell/header';
import {
  ActionIcon,
  Alert,
  Badge,
  Button,
  Card,
  Center,
  Container,
  Group,
  Loader,
  Stack,
  Text,
} from '@mantine/core';
import { FunnelIcon, TargetIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useRouteContext } from '@tanstack/react-router';

import { getStudentGoalsOptions } from '../api';
import type { Goal } from '../models';
import CreateGoalModal from './create-goal-modal';

export default function Goals() {
  const { student } = useRouteContext({ from: '/goals/' });

  const {
    data: goals,
    isLoading,
    error,
  } = useQuery(getStudentGoalsOptions(student.id));

  return (
    <>
      <Header
        title="Meus Planos"
        description="Visualize e organize seus planos de estudo"
        icon={<TargetIcon weight="bold" color="white" size={32} />}
      >
        <Group gap="sm">
          <Button
            variant="light"
            radius="sm"
            leftSection={<FunnelIcon weight="bold" size={14} />}
            visibleFrom="sm"
          >
            Filtro
          </Button>
          <ActionIcon
            variant="light"
            radius="sm"
            size="input-sm"
            hiddenFrom="sm"
            aria-label="Filtro"
          >
            <FunnelIcon size={18} />
          </ActionIcon>

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
          <Text c="dimmed">Nenhum plano criado ainda</Text>
        </Center>
      )}
    </Stack>
  );
}
