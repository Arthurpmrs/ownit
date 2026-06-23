import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  ActionIcon,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { IconCheckbox, IconPlus } from '@tabler/icons-react';
import { useState } from 'react';
import { useUpdateSessionChecklist } from '../hook';
import type { ChecklistItem } from '../models';
import { SortableChecklistItem } from './SortableChecklistItem';

interface SessionChecklistProps {
  sessionId: string;
  initialChecklist: ChecklistItem[];
  sessionStatus: string;
}

export function SessionChecklist({
  sessionId,
  initialChecklist = [],
  sessionStatus,
}: SessionChecklistProps) {
  const isReadOnly = sessionStatus !== 'doing';
  const { mutate } = useUpdateSessionChecklist(sessionId);
  const [newItemText, setNewItemText] = useState('');

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = initialChecklist.findIndex(
        (item) => item.id === active.id,
      );
      const newIndex = initialChecklist.findIndex(
        (item) => item.id === over.id,
      );

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const reorderedList = arrayMove(initialChecklist, oldIndex, newIndex);
      mutate({ sessionId, checklist: reorderedList });
    }
  }

  function handleToggleCheck(id: string) {
    const updated = initialChecklist.map((item) =>
      item.id === id ? { ...item, checked: !item.checked } : item,
    );
    mutate({ sessionId, checklist: updated });
  }

  function handleAddItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItemText.trim()) {
      return;
    }

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
          <IconCheckbox size={16} color="var(--mantine-color-orange-6)" />
          <Title order={5}>Checklist</Title>
        </Group>

        <DndContext
          sensors={isReadOnly ? [] : sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={initialChecklist}
            disabled={isReadOnly}
            strategy={verticalListSortingStrategy}
          >
            <Stack gap="xs" style={{ maxHeight: '350px', overflowY: 'auto' }}>
              {initialChecklist.length === 0 ? (
                <Text c="dimmed" size="sm" ta="center" my="sm">
                  Nenhuma tarefa adicionada para esta sessão.
                </Text>
              ) : (
                initialChecklist.map((item) => (
                  <SortableChecklistItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggleCheck}
                    onRemove={handleRemoveItem}
                    isReadOnly
                  />
                ))
              )}
            </Stack>
          </SortableContext>
        </DndContext>

        <Divider />

        {!isReadOnly ? (
          <form onSubmit={handleAddItem}>
            <Group gap="xs" align="flex-end" justify="center">
              <TextInput
                placeholder="Ex: Resolver lista de exercícios 3..."
                value={newItemText}
                onChange={(e) => setNewItemText(e.currentTarget.value)}
                style={{ flex: 1 }}
                radius="md"
              />
              <ActionIcon
                type="submit"
                color="orange"
                size="lg"
                variant="subtle"
                aria-label="Adicionar tarefa"
                title="Adicionar tarefa"
              >
                <IconPlus size={16} />
              </ActionIcon>
            </Group>
          </form>
        ) : (
          <Text size="xs" c="dimmed" ta="center">
            O checklist não pode ser alterado fora do modo de execução.
          </Text>
        )}
      </Stack>
    </Card>
  );
}
