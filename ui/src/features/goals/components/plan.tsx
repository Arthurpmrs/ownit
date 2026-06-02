import Header from '@/features/appshell/header';
import { Alert, Center, Container, Grid, Loader } from '@mantine/core';
import { BookOpenIcon } from '@phosphor-icons/react';
import { useQuery } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import { useState } from 'react';
import SessionKanban from './session-kanban';
import SessionPerformance from './session-performance';

import { getGoalByIdOptions } from '../api';
import type { Session } from '../models';

export default function Plan() {
  const { id } = useParams({ from: '/goals/$id' });
  const { data: goal, isLoading, error } = useQuery(getGoalByIdOptions(id));
  const [sessions, setSessions] = useState<Session[]>([]);

  const handleSessionCreate = (sessionData: Omit<Session, 'id' | 'goalId' | 'status'>) => {
    const newSession: Session = {
      ...sessionData,
      id: crypto.randomUUID(),
      goalId: id,
      status: 'pending',
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

  return (
    <>
      <Header
        title={goal.title}
        description={goal.description || 'Detalhes da sessão de estudo'}
        icon={<BookOpenIcon weight="bold" color="white" size={32} />}
      />

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
