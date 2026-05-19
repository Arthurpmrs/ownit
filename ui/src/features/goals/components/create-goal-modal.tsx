import {
  ActionIcon,
  Alert,
  Button,
  Group,
  Modal,
  Stack,
  TagsInput,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { CalendarBlankIcon, PlusIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useCreateGoal } from '../hooks';
import type { CreateGoalData } from '../models';

interface CreateGoalModalProps {
  studentId: number;
  disabled?: boolean;
}

export default function CreateGoalModal({
  studentId,
  disabled = false,
}: CreateGoalModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const openModal = () => setIsModalOpen(true);

  const form = useForm<CreateGoalData>({
    initialValues: {
      student_id: studentId,
      title: '',
      description: '',
      goal_tags: [],
      date_range: [null, null],
    },
    validate: {
      title: (value: string) =>
        value.length < 3 ? 'Título deve ter pelo menos 3 caracteres' : null,
      date_range: (value) =>
        !value[0] || !value[1]
          ? 'Selecione um intervalo de datas válido'
          : null,
    },
  });

  const createGoalMutation = useCreateGoal(studentId);

  function handleSubmit(values: CreateGoalData) {
    createGoalMutation.mutate(values, {
      onSuccess: () => {
        setIsModalOpen(false);
        form.reset();
        showNotification({
          title: 'Meta criada',
          message: 'Sua meta foi criada com sucesso.',
          color: 'green',
        });
      },
      onError: (error) => {
        showNotification({
          title: 'Erro ao criar meta',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          color: 'red',
        });
      },
    });
  }

  return (
    <>
      <Button
        radius="sm"
        leftSection={<PlusIcon weight="bold" size={14} />}
        disabled={disabled}
        onClick={openModal}
        visibleFrom="sm"
      >
        Novo Plano
      </Button>
      <ActionIcon
        radius="sm"
        size="input-sm"
        disabled={disabled}
        onClick={openModal}
        hiddenFrom="sm"
        aria-label="Novo Plano"
      >
        <PlusIcon weight="bold" size={18} />
      </ActionIcon>

      <Modal.Root
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="500px"
      >
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Stack gap={1} w="100%">
              <Group justify="space-between">
                <Modal.Title>Criar Novo Plano</Modal.Title>
                <Modal.CloseButton />
              </Group>
              <Text c="dimmed" size="sm">
                Utilize os campos abaixo para inciar a criação de um plano de
                estudos.
              </Text>
            </Stack>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  label="Título"
                  placeholder="Digite o título da meta"
                  radius="sm"
                  required
                  {...form.getInputProps('title')}
                />

                <Textarea
                  label="Descrição"
                  placeholder="Descreva sua meta (opcional)"
                  radius="sm"
                  minRows={3}
                  {...form.getInputProps('description')}
                />

                <TagsInput
                  label="Tags"
                  placeholder="Insira as tags"
                  radius="sm"
                  {...form.getInputProps('goal_tags')}
                />

                <DatePickerInput
                  leftSection={<CalendarBlankIcon size={18} />}
                  type="range"
                  label="Período"
                  placeholder="Insira o período em que deve ser conculuído"
                  required
                  {...form.getInputProps('date_range')}
                />

                {createGoalMutation.isError && (
                  <Alert color="red" title="Erro ao criar meta">
                    {createGoalMutation.error instanceof Error
                      ? createGoalMutation.error.message
                      : 'Erro desconhecido'}
                  </Alert>
                )}

                <Group justify="flex-end" mt="md">
                  <Button
                    variant="light"
                    radius="sm"
                    onClick={() => form.reset()}
                    disabled={createGoalMutation.isPending}
                  >
                    Limpar
                  </Button>
                  <Button
                    type="submit"
                    radius="sm"
                    loading={createGoalMutation.isPending}
                    disabled={!form.isValid()}
                  >
                    Criar Meta
                  </Button>
                </Group>
              </Stack>
            </form>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
