import { Card, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { useDebouncedCallback } from '@mantine/hooks';
import { Link, RichTextEditor } from '@mantine/tiptap';
import { IconCloudCheck, IconNote } from '@tabler/icons-react';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useEffect } from 'react';
import { useUpdateSessionNotes } from '../hook';

const INITIAL_NOTES = `<p>Use este espaço para fazer as anotações durante a execução da sessão.</p>`;

interface SessionNotesProps {
  sessionId: string;
  initialNotes: string;
}

export function SessionNotes({ sessionId, initialNotes }: SessionNotesProps) {
  const { mutate, isPending } = useUpdateSessionNotes(sessionId);
  initialNotes = initialNotes === '' ? INITIAL_NOTES : initialNotes;

  // Cria a função com debounce: só dispara 1500ms após o usuário parar de digitar
  const debouncedSave = useDebouncedCallback((htmlContent: string) => {
    mutate({ sessionId, new_notes: htmlContent });
  }, 1000);

  const editor = useEditor({
    extensions: [StarterKit.configure({ link: false }), Link, Underline],
    content: initialNotes,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      debouncedSave(html);
    },
  });

  useEffect(() => {
    if (editor && initialNotes !== editor.getHTML()) {
      editor.commands.setContent(initialNotes);
    }
  }, [initialNotes, editor]);

  return (
    <Card withBorder radius="md" padding="md">
      <Stack gap="sm">
        <Group justify="space-between">
          <Group gap="xs">
            <IconNote size={16} color="var(--mantine-color-orange-6)" />
            <Title order={5}>Anotações da Sessão</Title>
          </Group>
          <Group gap="xs">
            {isPending ? (
              <>
                <Loader size="xs" color="var(--mantine-color-orange-6)" />
                <Text size="xs" c="dimmed">
                  Salvando alterações...
                </Text>
              </>
            ) : (
              <>
                <IconCloudCheck size={16} color="green" />
                <Text size="xs" c="dimmed">
                  Anotações salvas
                </Text>
              </>
            )}
          </Group>
        </Group>

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
                  '#000000',
                  '#868E96',
                  '#FA5252',
                  '#E64980',
                  '#BE4BDB',
                  '#7950F2',
                  '#4C6EF5',
                  '#228BE6',
                  '#15AABF',
                  '#12B886',
                  '#40C057',
                  '#82C91E',
                  '#FAB005',
                  '#FD7E14',
                ]}
              />
            </RichTextEditor.ControlsGroup>
          </RichTextEditor.Toolbar>
          <RichTextEditor.Content />
        </RichTextEditor>
      </Stack>
    </Card>
  );
}
