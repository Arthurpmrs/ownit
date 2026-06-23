import {
  ActionIcon,
  Card,
  Checkbox,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconChecklist, IconPlus, IconTrash } from '@tabler/icons-react';
import { useState } from 'react';
import { useUpdateSessionChecklist } from '../hook';
import type { ChecklistItem } from '../models';

interface SessionChecklistProps {
  sessionId: string;
  initialChecklist: ChecklistItem[];
}

export function SessionChecklist({
  sessionId,
  initialChecklist,
}: SessionChecklistProps) {
  console.log(initialChecklist);
  const { mutate } = useUpdateSessionChecklist(sessionId);
  const [newItemText, setNewItemText] = useState('');

  function handleToggleCheck(id: string) {
    const updated = initialChecklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item,
    );
    mutate({ sessionId, checklist: updated });
  }

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemText.trim()) return;

    const newItem: ChecklistItem = {
      id: crypto.randomUUID(),
      text: newItemText.trim(),
      checked: false,
    };

    const updated = [...initialChecklist, newItem];
    mutate({ sessionId, checklist: updated });
    setNewItemText('');
  }

  function handleRemoveItem(id: string) {
    const updated = initialChecklist.filter((item) => item.id !== id);
    mutate({ sessionId, checklist: updated });
  }

  return (
    <Card withBorder radius="md" padding="lg">
      <Stack gap="md">
        <Group gap="xs">
          <IconChecklist size={16} color="var(--mantine-color-orange-6)" />
          <Title order={5}>Checklist</Title>
        </Group>

        <Stack gap="xs" style={{ maxHeight: '300px', overflowY: 'auto' }}>
          {initialChecklist.length === 0 ? (
            <Text c="dimmed" size="sm" ta="center" my="sm">
              Nenhuma tarefa adicionada para esta sessão.
            </Text>
          ) : (
            initialChecklist.map((item) => (
              <Group key={item.id} justify="space-between" wrap="nowrap">
                <Checkbox
                  checked={item.checked}
                  onChange={() => handleToggleCheck(item.id)}
                  color="orange"
                  size="xs"
                  styles={{
                    input: { cursor: 'pointer' },
                    label: {
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    },
                  }}
                  label={
                    <Text
                      size="sm"
                      style={{
                        textDecoration: item.checked ? 'line-through' : 'none',
                        color: item.checked
                          ? 'var(--mantine-color-gray-5)'
                          : 'inherit',
                        transition: 'all 0.2s ease',
                        lineHeight: 1,
                      }}
                    >
                      {item.text}
                    </Text>
                  }
                />
                <ActionIcon
                  variant="subtle"
                  color="red"
                  onClick={() => handleRemoveItem(item.id)}
                  title="Remover tarefa"
                >
                  <IconTrash size={16} />
                </ActionIcon>
              </Group>
            ))
          )}
        </Stack>

        <form onSubmit={handleAddItem}>
          <Group gap="xs" align="flex-end">
            <TextInput
              placeholder="Ex: Resolver lista de exercícios 3..."
              value={newItemText}
              onChange={(e) => setNewItemText(e.currentTarget.value)}
              style={{ flex: 1 }}
              radius="md"
            />
            <ActionIcon type="submit" color="orange" size="lg" variant="subtle">
              <IconPlus size={16} />
            </ActionIcon>
          </Group>
        </form>
      </Stack>
    </Card>
  );
}
