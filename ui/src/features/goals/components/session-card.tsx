import { Card, Group, Text, Title } from "@mantine/core";
import { CalendarIcon, ClockIcon } from "@phosphor-icons/react";
import type { Session } from "../models";

interface SessionCardProps {
  session: Session;
}

export default function SessionCard({ session }: SessionCardProps) {
  const formatDate = (date: Date | string | null) => {
    console.log('Formatting date:', date);
    if (!date) {
      return '-';
    }
    const dateObj = typeof date === 'string'
      ? new Date(date.replace(/-/g, '/'))
      : date;
    const day = String(dateObj.getUTCDate()).padStart(2, '0');
    const month = String(dateObj.getUTCMonth() + 1).padStart(2, '0');
    const year = dateObj.getUTCFullYear();

    const formattedDate = `${day}/${month}/${year}`;
    return formattedDate;
  };

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}min`;
    }
    return `${mins}min`;
  };

  return (
    <Card padding="md" radius="sm" withBorder>
      <Title order={5} mb={4}>{session.title}</Title>
      <Text size="sm" c="dimmed" mb="sm">{session.description}</Text>
      <Group gap="lg">
        <Group gap={4}>
          <CalendarIcon size={16} color="#868E96" />
          <Text size="xs" c="dimmed">{formatDate(session.start_time)} - {formatDate(session.end_time)}</Text>
        </Group>
        <Group gap={4}>
          <ClockIcon size={16} color="#868E96" />
          <Text size="xs" c="dimmed">{formatDuration(session.duration)}</Text>
        </Group>
      </Group>
    </Card>
  );
}