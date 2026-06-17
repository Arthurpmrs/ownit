import CreateSessionModal from '@/features/goal/components/create-session-modal';
import { useUpdateStudySessionStatus } from '@/features/goal/hooks';
import type { StudySessionShort } from '@/features/goal/models';
import type { Status } from '@/shared/models';
import {
  DragDropProvider,
  useDroppable,
  type DragEndEvent,
} from '@dnd-kit/react';
import {
  Box,
  Button,
  Center,
  Group,
  Modal,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import {
  IconCircleCheck,
  IconHourglass,
  IconPencil,
} from '@tabler/icons-react';
import { useCallback, useState } from 'react';
import SessionCard from './session-card';
import EvaluateSessionModal from '../../goal/components/evaluate-session-modal';

interface SessionKanbanProps {
  sessions: StudySessionShort[];
  goalId: string;
}

const STATUS_LABEL: Record<Status, string> = {
  to_do: 'Pendente',
  doing: 'Ativa',
  done: 'Concluída',
  canceled: 'Cancelada',
};

export default function SessionKanban({
  sessions,
  goalId,
}: SessionKanbanProps) {
  const [pendingTransition, setPendingTransition] = useState<{
    sessionId: string;
    currentStatus: Status;
    newStatus: Status;
  } | null>(null);
  const [selectedSessionToFinish, setSelectedSessionToFinish] = useState<
    string | null
  >(null);
  const [isEvaluateModalOpen, setIsEvaluateModalOpen] =
    useState<boolean>(false);

  const updateStatus = useUpdateStudySessionStatus(goalId);

  const handleDragEnd = useCallback(
    ({ operation, canceled }: Parameters<DragEndEvent>[0]) => {
      if (canceled || !operation.source || !operation.target) {
        return;
      }

      const sessionId = operation.source.data.sessionId as string;
      const currentStatus = operation.source.data.currentStatus as Status;
      const newStatus = operation.target.data.status as Status;

      if (currentStatus === newStatus) {
        return;
      }

      if (
        newStatus === 'doing' &&
        sessions.some((s) => s.status === 'doing' && s.id !== sessionId)
      ) {
        return;
      }

      if (currentStatus === 'to_do' && newStatus === 'doing') {
        updateStatus.mutate({ sessionId, currentStatus, newStatus });
        return;
      }

      if (newStatus === 'done') {
        setSelectedSessionToFinish(sessionId);
        setIsEvaluateModalOpen(true);
        return;
      }

      setPendingTransition({ sessionId, currentStatus, newStatus });
    },
    [sessions, updateStatus],
  );

  const handleConfirm = () => {
    if (!pendingTransition) {
      return;
    }
    updateStatus.mutate(pendingTransition);
    setPendingTransition(null);
  };

  const activeSessions = sessions.filter((s) => s.status === 'doing');
  const pendingSessions = sessions.filter((s) => s.status === 'to_do');
  const completedSessions = sessions.filter((s) => s.status === 'done');

  return (
    <>
      <DragDropProvider onDragEnd={handleDragEnd}>
        <Stack gap="lg">
          <Group justify="space-between" align="center">
            <Title order={3}>Sessões</Title>
            <CreateSessionModal goalId={goalId} />
          </Group>

          <Stack gap="md">
            <SessionColumn
              status="doing"
              title="Ativa"
              sessions={activeSessions}
              icon={<IconPencil size={16} color="#000" />}
            />
            <SessionColumn
              status="to_do"
              title="Pendentes"
              sessions={pendingSessions}
              icon={<IconHourglass size={16} color="#000" />}
            />
            <SessionColumn
              status="done"
              title="Concluídas"
              sessions={completedSessions}
              icon={<IconCircleCheck size={16} color="#000" />}
            />
          </Stack>
        </Stack>
      </DragDropProvider>

      <Modal
        opened={!!pendingTransition}
        onClose={() => setPendingTransition(null)}
        title="Confirmar mudança de status"
        centered
        size="sm"
      >
        <Text size="sm">
          Tem certeza que deseja mover esta sessão para{' '}
          <strong>
            {pendingTransition ? STATUS_LABEL[pendingTransition.newStatus] : ''}
          </strong>
          ?
        </Text>
        <Group justify="flex-end" mt="lg">
          <Button variant="light" onClick={() => setPendingTransition(null)}>
            Cancelar
          </Button>
          <Button onClick={handleConfirm} loading={updateStatus.isPending}>
            Confirmar
          </Button>
        </Group>
      </Modal>

      <EvaluateSessionModal
        goalId={goalId}
        sessionId={selectedSessionToFinish}
        isOpen={isEvaluateModalOpen}
        setIsOpen={setIsEvaluateModalOpen}
      />
    </>
  );
}

interface SessionColumnProps {
  status: Status;
  title: string;
  sessions: StudySessionShort[];
  icon: React.ReactNode;
}

function SessionColumn({ status, title, sessions, icon }: SessionColumnProps) {
  const { ref, isDropTarget } = useDroppable({
    id: `column-${status}`,
    data: { status },
  });

  return (
    <Stack gap="xs">
      <Group gap="xs">
        {icon}
        <Text size="sm" fw={500}>
          {title}
        </Text>
        <Box
          flex={1}
          style={{ borderBottom: '2px solid #EAE1D7', alignSelf: 'center' }}
        />
      </Group>
      <Box
        ref={ref}
        style={{
          minHeight: 48,
          borderRadius: 8,
          transition: 'background 150ms ease',
          background: isDropTarget ? 'rgba(0,0,0,0.04)' : 'transparent',
          padding: isDropTarget ? 4 : 0,
        }}
      >
        {sessions.length > 0 ? (
          <Stack gap="xs">
            {sessions.map((session) => (
              <SessionCard key={session.id} session={session} />
            ))}
          </Stack>
        ) : (
          <Center>
            <Text size="xs" c="dimmed" p="xs">
              Nenhuma sessão
            </Text>
          </Center>
        )}
      </Box>
    </Stack>
  );
}
