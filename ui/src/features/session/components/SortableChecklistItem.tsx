import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ActionIcon, Checkbox, Group, Text } from '@mantine/core';
import { IconGripVertical, IconTrash } from '@tabler/icons-react';
import type { ChecklistItem } from '../models';

interface SortableItemProps {
  item: ChecklistItem;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  isReadOnly: boolean;
}

export function SortableChecklistItem({
  item,
  onToggle,
  onRemove,
  isReadOnly,
}: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    backgroundColor: isDragging ? '#FAF5EF' : 'transparent',
    opacity: isDragging ? 0.6 : 1,
    padding: '4px 8px',
    borderRadius: '6px',
  };

  return (
    <Group ref={setNodeRef} style={style} wrap="nowrap" justify="space-between">
      <Group gap="xs" style={{ flex: 1 }} wrap="nowrap">
        <div
          {...attributes}
          {...listeners}
          style={{ display: 'flex', alignItems: 'center', cursor: 'grab' }}
        >
          <IconGripVertical size={16} color="var(--mantine-color-gray-4)" />
        </div>

        <Checkbox
          disabled={isReadOnly}
          checked={item.checked}
          onChange={() => onToggle(item.id)}
          color="orange"
          size="xs"
          styles={{
            input: { cursor: 'pointer' },
            label: { cursor: 'pointer', display: 'flex', alignItems: 'center' },
          }}
          label={
            <Text
              size="sm"
              style={{
                textDecoration: item.checked ? 'line-through' : 'none',
                color: item.checked ? 'var(--mantine-color-gray-5)' : 'inherit',
                transition: 'all 0.2s ease',
                lineHeight: 1,
              }}
            >
              {item.text}
            </Text>
          }
        />
      </Group>

      <ActionIcon
        variant="subtle"
        color="red"
        onClick={() => onRemove(item.id)}
        title="Remover tarefa"
        aria-label="Remover tarefa"
        disabled={isReadOnly}
      >
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  );
}
