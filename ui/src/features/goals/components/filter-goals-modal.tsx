import {
  ActionIcon,
  Box,
  Button,
  CloseButton,
  Group,
  Popover,
  Select,
  Stack,
  TagsInput,
  Text,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { FunnelIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { statusMapper } from '../mappers';
import type { Status } from '../models';

export interface FilterGoalsValues {
  status: Status | null;
  goal_tags: string[];
}

interface FilterGoalsModalProps {
  onFilter: (values: FilterGoalsValues) => void;
  onClear: () => void;
  isLoading: boolean;
}

export default function FilterGoalsModal({
  onFilter,
  onClear,
  isLoading,
}: FilterGoalsModalProps) {
  const [opened, setOpened] = useState<boolean>(false);

  const form = useForm<FilterGoalsValues>({
    initialValues: {
      status: null,
      goal_tags: [],
    },
  });

  function handleSubmit(values: FilterGoalsValues) {
    onFilter(values);
    setOpened(false);
  }

  function handleClear() {
    form.reset();
    onClear();
  }

  const hasFiltersSelected =
    form.values.status !== null || form.values.goal_tags.length > 0;

  return (
    <>
      <Popover
        width={450}
        opened={opened}
        onChange={setOpened}
        closeOnClickOutside={false}
        position="bottom-end"
        withArrow
        shadow="md"
      >
        <Popover.Target>
          <Box display="inline-block">
            <Button
              variant="light"
              radius="sm"
              leftSection={<FunnelIcon weight="bold" size={14} />}
              visibleFrom="sm"
              onClick={() => setOpened((o) => !o)}
            >
              Filtro
            </Button>
            <ActionIcon
              variant="light"
              radius="sm"
              size="input-sm"
              hiddenFrom="sm"
              aria-label="Filtro"
              onClick={() => setOpened((o) => !o)}
            >
              <FunnelIcon size={18} />
            </ActionIcon>
          </Box>
        </Popover.Target>

        <Popover.Dropdown>
          <Stack>
            <Stack gap={0}>
              <Group justify="space-between">
                <Text size="md" fw={600}>
                  Filtrar Planos
                </Text>
                <CloseButton
                  size="sm"
                  onClick={() => setOpened(false)}
                  aria-label="Close menu"
                />
              </Group>
              <Text c="dimmed" size="sm" lh="xs">
                Utilize os campos abaixo para filtrar a exibição de planos na
                tela.
              </Text>
            </Stack>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <Select
                  label="Status"
                  placeholder="Selecione um status"
                  data={[
                    { value: 'to_do', label: statusMapper('to_do') },
                    { value: 'doing', label: statusMapper('doing') },
                    { value: 'done', label: statusMapper('done') },
                    { value: 'canceled', label: statusMapper('canceled') },
                  ]}
                  clearable
                  {...form.getInputProps('status')}
                />
                <TagsInput
                  label="Tags"
                  placeholder="Insira as tags"
                  {...form.getInputProps('goal_tags')}
                />
                <Group justify="flex-end" mt="sm">
                  <Button
                    type="button"
                    variant="light"
                    radius="sm"
                    onClick={handleClear}
                  >
                    Limpar
                  </Button>
                  <Button
                    type="submit"
                    radius="sm"
                    loading={isLoading}
                    disabled={!hasFiltersSelected}
                  >
                    Filtrar
                  </Button>
                </Group>
              </Stack>
            </form>
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </>
  );
}
