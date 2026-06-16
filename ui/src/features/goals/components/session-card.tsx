import { Card, Group, Text, Title } from '@mantine/core';
import { useDraggable } from '@dnd-kit/react';
import { CalendarIcon, ClockIcon } from '@phosphor-icons/react';
import type { StudySessionShort } from '@/features/goal/models';
import { useNavigate } from '@tanstack/react-router';
import { useRef } from 'react';

interface SessionCardProps {
  session: StudySessionShort;
}

const DRAG_THRESHOLD_PX = 5;

export default function SessionCard({ session }: SessionCardProps) {
  const navigate = useNavigate();
  const pointerStart = useRef<{ x: number; y: number } | null>(null);

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

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStart.current = { x: e.clientX, y: e.clientY };
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (!pointerStart.current) { return; }
    const dx = Math.abs(e.clientX - pointerStart.current.x);
    const dy = Math.abs(e.clientY - pointerStart.current.y);
    if (dx < DRAG_THRESHOLD_PX && dy < DRAG_THRESHOLD_PX) {
      navigate({ to: '/sessions/$id', params: { id: session.id } });
    }
    pointerStart.current = null;
  };

  return (
    <Card
      ref={ref}
      padding="md"
      radius="lg"
      withBorder
      style={{ opacity: isDragging ? 0.4 : 1, cursor: 'grab' }}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
    >
      <Title order={5} mb={4}>
        {session.title}
      </Title>
      <Text size="sm" c="dimmed" mb="sm">
        {session.description}
      </Text>
      <Group gap="lg">
        <Group gap={4}>
          <CalendarIcon size={16} color="#868E96" />
          <Text size="xs" c="dimmed">
            {formatDate(session.plannedToStartAt)} -{' '}
            {formatDate(session.plannedToEndAt)}
          </Text>
        </Group>
        <Group gap={4}>
          <ClockIcon size={16} color="#868E96" />
          <Text size="xs" c="dimmed">
            {session.duration}
          </Text>
        </Group>
      </Group>
    </Card>
  );
}
