import Header from '@/features/appshell/header';
import {
  ActionIcon,
  Button,
  Card,
  Checkbox,
  Flex,
  Grid,
  Group,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { Link, RichTextEditor } from '@mantine/tiptap';
import {
  CalendarIcon,
  CheckSquareIcon,
  ClockIcon,
  GraduationCapIcon,
  PencilSimpleIcon,
  SmileyIcon,
  TargetIcon,
} from '@phosphor-icons/react';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { useState } from 'react';

const MOCK_SESSION = {
  title: 'Fundamentos de UI/UX Design',
  goalTitle: 'Dominar UI/UX',
  dateRange: '15 Jan - 30 Mar 2024',
  totalDuration: '180 min totais',
};

const INITIAL_CHECKLIST = [
  { id: 1, label: 'Text here', checked: true },
  { id: 2, label: 'Text here', checked: false },
  { id: 3, label: 'Text here', checked: false },
  { id: 4, label: 'Text here', checked: false },
];

const INITIAL_NOTES = `<ul><li>Princípios de hierarquia visual</li><li>Regras de espaçamento e alinhamento</li><li>Teoria das cores aplicada a interfaces</li></ul>`;

export default function SessionExecution() {
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

  const toggleChecklistItem = (id: number) => {
    setChecklist((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)),
    );
  };

  const handleAddComment = () => {
    if (!comment.trim()) { return; }
    setComment('');
  };

  return (
    <>
      <Header
        title={MOCK_SESSION.title}
        description={
          <Group gap="lg" mt={4}>
            <Flex align="center" gap={6}>
              <TargetIcon size={14} color="#868E96" weight="bold" />
              <Text component="span" size="xs" c="dimmed">
                {MOCK_SESSION.goalTitle}
              </Text>
            </Flex>
            <Flex align="center" gap={6}>
              <CalendarIcon size={14} color="#868E96" weight="bold" />
              <Text component="span" size="xs" c="dimmed">
                {MOCK_SESSION.dateRange}
              </Text>
            </Flex>
            <Flex align="center" gap={6}>
              <ClockIcon size={14} color="#868E96" weight="bold" />
              <Text component="span" size="xs" c="dimmed">
                {MOCK_SESSION.totalDuration}
              </Text>
            </Flex>
          </Group>
        }
        icon={<GraduationCapIcon weight="bold" color="white" size={32} />}
      >
        <Button variant="outline" color="orange">
          Finalizar Sessão
        </Button>
      </Header>

      <Grid py="xl" px="xl" gap="xl">
        {/* Anotações + Histórico de eventos */}
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="xl">
            {/* Anotações */}
            <Stack gap="sm">
              <Title order={4}>Anotações</Title>
              <RichTextEditor editor={editor}>
                <RichTextEditor.Toolbar>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.Bold />
                    <RichTextEditor.Italic />
                    <RichTextEditor.Strikethrough />
                    <RichTextEditor.Underline />
                    <RichTextEditor.Link />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.H1 />
                    <RichTextEditor.H2 />
                    <RichTextEditor.H3 />
                    <RichTextEditor.H4 />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.BulletList />
                    <RichTextEditor.OrderedList />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.AlignLeft />
                    <RichTextEditor.AlignCenter />
                    <RichTextEditor.AlignRight />
                  </RichTextEditor.ControlsGroup>
                  <RichTextEditor.ControlsGroup>
                    <RichTextEditor.ColorPicker
                      colors={[
                        '#000000', '#868E96', '#FA5252', '#E64980',
                        '#BE4BDB', '#7950F2', '#4C6EF5', '#228BE6',
                        '#15AABF', '#12B886', '#40C057', '#82C91E',
                        '#FAB005', '#FD7E14',
                      ]}
                    />
                  </RichTextEditor.ControlsGroup>
                </RichTextEditor.Toolbar>
                <RichTextEditor.Content />
              </RichTextEditor>
            </Stack>

            {/* Event history section */}
            <Stack gap="sm">
              <Title order={4}>Histórico de eventos</Title>
              <p>historico de eventos</p>
            </Stack>

            {/* Comment area */}
            <Stack gap="sm">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.currentTarget.value)}
                placeholder="Escreva comentários para ajuda nos seus próximos planejamentos"
                minRows={3}
                autosize
                styles={{ input: { backgroundColor: 'white' } }}
              />
              <Flex justify="flex-end">
                <Button color="orange" onClick={handleAddComment}>
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
            <Card radius="md" withBorder padding="xl">
              <Stack align="center" gap="lg">
                <Title order={5}>Pomodoro</Title>
                <p>pomodoro</p>
              </Stack>
            </Card>

            {/* Checklist */}
            <Card radius="md" withBorder padding="lg">
              <Group justify="space-between" mb="md">
                <Group gap="xs">
                  <CheckSquareIcon
                    size={20}
                    color="var(--mantine-color-orange-6)"
                    weight="fill"
                  />
                  <Title order={5}>Checklist</Title>
                </Group>
                <ActionIcon variant="subtle" color="gray" size="sm">
                  <PencilSimpleIcon size={16} />
                </ActionIcon>
              </Group>

              <Stack gap="sm">
                {checklist.map((item) => (
                  <Checkbox
                    key={item.id}
                    checked={item.checked}
                    onChange={() => toggleChecklistItem(item.id)}
                    label={item.label}
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

      {/* FAB — mascot chatbot button */}
      <ActionIcon
        size={56}
        radius="xl"
        color="orange"
        variant="filled"
        style={{
          position: 'fixed',
          bottom: 32,
          right: 32,
          zIndex: 100,
        }}
      >
        <SmileyIcon size={28} weight="fill" color="white" />
      </ActionIcon>
    </>
  );
}