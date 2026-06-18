import type { StudySessionShort } from '@/features/goal/models';
import { useDraggable } from '@dnd-kit/react';
import { Card, Group, Text, Title } from '@mantine/core';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import { useNavigate } from '@tanstack/react-router';

interface SessionCardProps {
  session: StudySessionShort;
}

export default function SessionCard({ session }: SessionCardProps) {
  const navigate = useNavigate();

  const { ref, isDragging } = useDraggable({
    id: session.id,
    data: { sessionId: session.id, currentStatus: session.status },
    disabled: session.status === 'done',
  });

  const formatDate = (date: Date) => {
    const hour = String(date.getUTCHours()).padStart(2, '0');
    const minute = String(date.getMinutes()).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year} às ${hour}:${minute}`;
  };

  const handleClick = () => {
    navigate({ to: '/sessions/$id', params: { id: session.id } });
  };

  return (
    <Card
      ref={ref}
      padding="md"
      radius="lg"
      withBorder
      style={{
        opacity: isDragging ? 0.4 : 1,
        cursor: session.status === 'done' ? 'default' : 'grab',
      }}
      onClick={handleClick}
    >
      <Title order={5} mb={4}>
        {session.title}
      </Title>
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
    </Card>
  );
}
