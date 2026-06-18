import type { StudySessionShort } from '@/features/goal/models';
import { useNavigate } from '@tanstack/react-router';
import { useDraggable } from '@dnd-kit/react';
import { Card, Group, Text, Title } from '@mantine/core';
import { IconCalendar, IconClock } from '@tabler/icons-react';

interface SessionCardProps {
  session: StudySessionShort;
}

export default function SessionCard({ session }: SessionCardProps) {
  const navigate = useNavigate();

  const { ref, isDragging } = useDraggable({
    id: session.id,
    data: { sessionId: session.id, currentStatus: session.status },
  });

  const formatDate = (date: Date) => {
    const day = String(date.getUTCDate()).padStart(2, '0');
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year}`;
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
        cursor: isDragging ? 'grabbing' : 'pointer',
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
            {formatDate(session.plannedToStartAt)} -{' '}
            {formatDate(session.plannedToEndAt)}
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
