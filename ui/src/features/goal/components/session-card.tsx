import type { StudySessionShort } from '@/features/session/models';
import { useDraggable } from '@dnd-kit/react';
import {
  ActionIcon,
  Anchor,
  Card,
  Group,
  Menu,
  Text,
  Title,
  Tooltip,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import {
  IconCalendar,
  IconClock,
  IconDots,
  IconPencil,
} from '@tabler/icons-react';
import { Link } from '@tanstack/react-router';
import EditSessionModal from './edit-session-modal';
import type { Status } from '@/shared/models';

interface SessionCardProps {
  session: StudySessionShort;
  goalId: string;
  goalStatus: Status;
}

export default function SessionCard({ session, goalId, goalStatus }: SessionCardProps) {
  const [editOpened, { open: openEdit, close: closeEdit }] =
    useDisclosure(false);

  const isDragDisabled = session.status === 'done' || goalStatus === 'done' || goalStatus === 'to_do';

  const { ref, isDragging } = useDraggable({
    id: session.id,
    data: { sessionId: session.id, currentStatus: session.status },
    disabled: isDragDisabled,
  });

  const formatDate = (date: Date) => {
    const hour = String(date.getHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year} às ${hour}:${minute}`;
  };

  return (
    <>
      <Card
        ref={ref}
        padding="md"
        radius="lg"
        withBorder
        style={{
          opacity: isDragging ? 0.4 : 1,
          cursor: isDragDisabled ? 'default' : 'grab',
        }}
      >
        <Group justify="space-between" align="flex-start" mb={4}>
          <Title order={5} style={{ flex: 1 }}>
            <Anchor
              component={Link}
              to="/sessions/$id"
              params={{ id: session.id }}
              c="black"
              underline={session.status === 'doing' ? 'hover' : 'never'}
              style={{
                cursor:
                  session.status === 'doing'
                    ? 'pointer'
                    : isDragDisabled
                      ? 'default'
                      : 'grab',
              }}
              disabled={!(session.status === 'doing')}
              {...({} as any)}
            >
              {session.title}
            </Anchor>
          </Title>
          <Menu position="bottom-end" withinPortal>
            <Menu.Target>
              <ActionIcon
                variant="subtle"
                color="gray"
                size="sm"
                onClick={(e) => e.stopPropagation()}
              >
                <IconDots size={16} />
              </ActionIcon>
            </Menu.Target>
            <Menu.Dropdown onClick={(e) => e.stopPropagation()}>
              <Tooltip
                label="Não é possível editar uma sessão concluída"
                disabled={session.status !== 'done'}
                position="right"
              >
                <Menu.Item
                  leftSection={<IconPencil size={14} />}
                  disabled={session.status === 'done'}
                  onClick={openEdit}
                >
                  Editar
                </Menu.Item>
              </Tooltip>
            </Menu.Dropdown>
          </Menu>
        </Group>
        <Text size="sm" c="dimmed" mb="sm">
          {session.description}
        </Text>
        <Group gap="lg">
          <Group gap={4}>
            <IconCalendar size={16} color="#868E96" />
            <Text size="xs" c="dimmed">
              {formatDate(session.plannedToStartAt)}
            </Text>
          </Group>
          <Group gap={4}>
            <IconClock size={16} color="#868E96" />
            <Text size="xs" c="dimmed">
              {session.duration}
            </Text>
          </Group>
        </Group>
      </Card >

      <EditSessionModal
        goalId={goalId}
        session={session}
        opened={editOpened}
        onClose={closeEdit}
      />
    </>
  );
}
