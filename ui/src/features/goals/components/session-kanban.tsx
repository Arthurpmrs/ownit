import { Group, Stack, Text, Title, Box } from "@mantine/core";
import type { Session } from "../models";
import CreateSessionModal from "./create-session-modal";
import SessionCard from "./session-card";
import { PencilSimpleIcon, HourglassMediumIcon, CheckCircleIcon } from "@phosphor-icons/react";

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
        <SessionColumn title="Ativa" sessions={activeSessions} icon={<PencilSimpleIcon size={16} color="#000" />} />
        <SessionColumn title="Pendentes" sessions={pendingSessions} icon={<HourglassMediumIcon size={16} color="#000" />} />
        <SessionColumn title="Concluídas" sessions={completedSessions} icon={<CheckCircleIcon size={16} color="#000" />} />
      </Stack>
    </Stack>
  );
}

interface SessionColumnProps {
  title: string;
  sessions: Session[];
  icon: React.ReactNode;
}

function SessionColumn({ title, sessions, icon }: SessionColumnProps) {
  return (
    <Stack gap="xs">
      <Group gap="xs">
        {icon}
        <Text size="sm" fw={500}>{title}</Text>
        <Box flex={1} style={{ borderBottom: '2px solid #EAE1D7', alignSelf: 'center' }} />

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