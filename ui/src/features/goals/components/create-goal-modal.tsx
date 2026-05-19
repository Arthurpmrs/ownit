import {
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
import { CalendarBlankIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useCreateGoal } from '../hooks';
import type { CreateGoalData } from '../models';

interface CreateGoalModalProps {
  studentId: number;
  disabled?: boolean;
}

interface GoalFormValues {
  student_id: number;
  title: string;
  description: string;
  goal_tags: string[];
  date_range: [Date | null, Date | null];
}

export default function CreateGoalModal({
  studentId,
  disabled = false,
}: CreateGoalModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm<GoalFormValues>({
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

  function handleSubmit(values: GoalFormValues) {
    if (!values.date_range[0] || !values.date_range[1]) {
      return;
    }

    const payload: CreateGoalData = {
      ...values,
      goal_tags: values.goal_tags || [],
      start_date: values.date_range[0],
      end_date: values.date_range[1],
    };

    createGoalMutation.mutate(payload, {
      onSuccess: () => {
        setIsModalOpen(false);
        form.reset();
        showNotification({
          title: 'Plano criado',
          message: 'Seu Plano foi criado com sucesso.',
          color: 'green',
        });
      },
      onError: (error) => {
        showNotification({
          title: 'Erro ao criar Plano',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          color: 'red',
        });
      },
    });
  }

  return (
    <>
      <Button disabled={disabled} onClick={() => setIsModalOpen(true)}>
        + Nova Meta
      </Button>
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
                  placeholder="Digite o título do plano"
                  radius="sm"
                  required
                  {...form.getInputProps('title')}
                />

                <Textarea
                  label="Descrição"
                  placeholder="Descreva seu plano (opcional)"
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
                  minDate={new Date()}
                  required
                  {...form.getInputProps('date_range')}
                />

                {createGoalMutation.isError && (
                  <Alert color="red" title="Erro ao criar plano">
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
                    Criar Plano
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
