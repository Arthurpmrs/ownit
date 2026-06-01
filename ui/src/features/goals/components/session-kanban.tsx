import { Badge, Group, Stack, Text, Title } from "@mantine/core";
import type { Session } from "../models";
import CreateSessionModal from "./create-session-modal";
import SessionCard from "./session-card";

interface SessionKanbanProps {
  sessions: Session[];
  onSessionCreate: (session: Omit<Session, 'id' | 'goalId' | 'status'>) => void;
}

export default function SessionKanban({ sessions, onSessionCreate }: SessionKanbanProps) {
  const activeSessions = sessions.filter((s) => s.status === 'active');
  const pendingSessions = sessions.filter((s) => s.status === 'pending');
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  return (
    <Stack gap="lg">
      <Group gap="sm" align="center">
        <Title order={3}>Sessões</Title>
        <CreateSessionModal onSessionCreate={onSessionCreate} />
      </Group>

      <Stack gap="md">
        <SessionColumn title="Ativa" sessions={activeSessions} color="green" />
        <SessionColumn title="Pendentes" sessions={pendingSessions} color="orange" />
        <SessionColumn title="Concluídas" sessions={completedSessions} color="gray" />
      </Stack>
    </Stack>
  );
}

interface SessionColumnProps {
  title: string;
  sessions: Session[];
  color: string;
}

function SessionColumn({ title, sessions, color }: SessionColumnProps) {
  return (
    <Stack gap="xs">
      <Group gap="xs">
        <Text size="sm" fw={500}>{title}</Text>
        <Badge size="sm" variant="light" color={color}>{sessions.length}</Badge>
      </Group>
      {sessions.length > 0 ? (
        sessions.map((session) => (
          <SessionCard key={session.id} session={session} />
        ))
      ) : (
        <Text size="xs" c="dimmed">Nenhuma sessão</Text>
      )}
    </Stack>
  );
}