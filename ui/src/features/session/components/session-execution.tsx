import Header from '@/features/appshell/header';
import { useUpdateStudySessionStatus } from '@/features/goal/hooks';
import {
  ActionIcon,
  Alert,
  Button,
  Card,
  Center,
  Checkbox,
  Container,
  Flex,
  Grid,
  Group,
  Loader,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import {
  IconCalendar,
  IconClock,
  IconPencil,
  IconSchool,
  IconSquareCheck,
  IconTarget,
} from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from '@tanstack/react-router';
import Color from '@tiptap/extension-color';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { TextStyle } from '@tiptap/extension-text-style';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect, useState } from 'react';
import { getStudySessionOptions } from '../api';
import { Pomodoro } from './pomodoro';
import { SessionNotes } from './session-notes';

const INITIAL_CHECKLIST = [
  { id: 1, label: 'Text here', checked: true },
  { id: 2, label: 'Text here', checked: false },
  { id: 3, label: 'Text here', checked: false },
  { id: 4, label: 'Text here', checked: false },
];

const INITIAL_NOTES = `<p>Use este espaço para fazer as anotações durante a execução da sessão.</p>`;

export default function SessionExecution() {
  const { id } = useParams({ from: '/sessions/$id' });
  const { data, isLoading, error } = useQuery(getStudySessionOptions(id));

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
    content: INITIAL_NOTES,
  });

  const [comment, setComment] = useState('');
  const [checklist, setChecklist] = useState(INITIAL_CHECKLIST);

  const isFinished = data?.studySession.status === 'done';

  const queryClient = useQueryClient();
  const updateStatus = useUpdateStudySessionStatus(
    data?.studySession.goalId ?? '',
  );

  const handleFinishSession = () => {
    if (!data) {
      return;
    }
    const { studySession } = data;
    updateStatus.mutate(
      {
        sessionId: studySession.id,
        currentStatus: studySession.status,
        newStatus: 'done',
      },
      {
        onSuccess: () =>
          queryClient.invalidateQueries({
            queryKey: getStudySessionOptions(id).queryKey,
          }),
      },
    );
  };

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isFinished);
    }
  }, [editor, isFinished]);

  const toggleChecklistItem = (itemId: number) => {
    setChecklist((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, checked: !item.checked } : item,
      ),
    );
  };

  const handleAddComment = () => {
    if (!comment.trim()) {
      return;
    }
    setComment('');
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
        <Alert title="Erro ao carregar sessão" color="red">
          {error instanceof Error ? error.message : 'Erro desconhecido'}
        </Alert>
      </Container>
    );
  }

  if (!data) {
    return (
      <Container py="xl">
        <Alert title="Sessão não encontrada" color="yellow">
          A sessão solicitada não existe.
        </Alert>
      </Container>
    );
  }

  const { studySession } = data;

  const formatDate = (date: Date) =>
    date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });

  const dateRange = `${formatDate(studySession.plannedToStartAt)} - ${formatDate(studySession.plannedToEndAt)}`;

  return (
    <>
      <Header
        title={studySession.title}
        description={
          <Group gap="lg" mt={4}>
            <Flex align="center" gap={6}>
              <IconTarget size={14} color="#868E96" stroke={2} />
              <Text component="span" size="xs" c="dimmed">
                {studySession.goalTitle}
              </Text>
            </Flex>
            <Flex align="center" gap={6}>
              <IconCalendar size={14} color="#868E96" stroke={2} />
              <Text component="span" size="xs" c="dimmed">
                {dateRange}
              </Text>
            </Flex>
            <Flex align="center" gap={6}>
              <IconClock size={14} color="#868E96" stroke={2} />
              <Text component="span" size="xs" c="dimmed">
                {studySession.duration}
              </Text>
            </Flex>
          </Group>
        }
        icon={<IconSchool stroke={2} color="white" size={32} />}
      >
        <Button
          variant="outline"
          color="orange"
          disabled={isFinished}
          loading={updateStatus.isPending}
          onClick={handleFinishSession}
        >
          Finalizar Sessão
        </Button>
      </Header>

      <Grid py="xl" px="xl" gap="xl">
        {/* Anotações + Histórico de eventos */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="xl">
            {/* Anotações */}
            <SessionNotes
              sessionId={studySession.id}
              initialNotes={
                studySession.notes === '' ? INITIAL_NOTES : studySession.notes
              }
            />

            {/* histórico */}
            <Stack gap="sm">
              <Title order={4}>Histórico de eventos</Title>
              <p>historico de eventos</p>
            </Stack>

            {/* Comentários */}
            <Stack gap="sm">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.currentTarget.value)}
                placeholder="Escreva comentários para ajuda nos seus próximos planejamentos"
                minRows={3}
                autosize
                disabled={isFinished}
                styles={{ input: { backgroundColor: 'white' } }}
              />
              <Flex justify="flex-end">
                <Button
                  color="orange"
                  onClick={handleAddComment}
                  disabled={isFinished}
                >
                  Adicionar comentário
                </Button>
              </Flex>
            </Stack>
          </Stack>
        </Grid.Col>

        {/* Pomodoro + Checklist */}
        <Grid.Col span={{ base: 12, md: 4 }}>
          <Stack gap="lg">
            {/* Pomodoro */}
            <Pomodoro
              sessionId={studySession.id}
              sessionDuration={studySession.duration}
              pomodoro={studySession.pomodoro}
            />

            {/* Checklist */}
            <Card radius="md" withBorder padding="lg">
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <IconSquareCheck
                    size={20}
                    color="var(--mantine-color-orange-6)"
                  />
                  <Title order={5}>Checklist</Title>
                </Group>
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="sm"
                  disabled={isFinished}
                >
                  <IconPencil size={16} />
                </ActionIcon>
              </Group>

              <Stack gap="sm">
                {checklist.map((item) => (
                  <Checkbox
                    key={item.id}
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    label={item.label}
                    disabled={isFinished}
                    color="orange"
                    styles={{
                      input: { cursor: 'pointer' },
                      label: { cursor: 'pointer' },
                    }}
                  />
                ))}
              </Stack>
            </Card>
          </Stack>
        </Grid.Col>
      </Grid>
    </>
  );
}
