import {
  Button,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  TextInput,
} from '@mantine/core';
import { DateTimePicker, TimePicker } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { IconCalendar, IconClock } from '@tabler/icons-react';
import { useUpdateStudySession } from '../hooks';
import type { StudySessionShort } from '../models';

interface EditSessionFormValues {
  title: string;
  description: string;
  planned_date: Date | null;
  session_duration: string;
}

interface EditSessionModalProps {
  goalId: string;
  session: StudySessionShort;
  opened: boolean;
  onClose: () => void;
}

export default function EditSessionModal({
  goalId,
  session,
  opened,
  onClose,
}: EditSessionModalProps) {
  const form = useForm<EditSessionFormValues>({
    initialValues: {
      title: session.title,
      description: session.description,
      planned_date: session.plannedToStartAt,
      session_duration: session.duration,
    },
    validate: {
      title: (value) =>
        value.trim().length < 3
          ? 'Título deve ter pelo menos 3 caracteres'
          : null,
      planned_date: (value) => (!value ? 'Selecione a data planejada' : null),
      session_duration: (value) =>
        !value ? 'Informe a duração da sessão' : null,
    },
  });

  const updateMutation = useUpdateStudySession(goalId);

  function handleSubmit(values: EditSessionFormValues) {
    updateMutation.mutate(
      {
        sessionId: session.id,
        title: values.title,
        description: values.description,
        planned_to_start_at: values.planned_date,
        duration: values.session_duration,
      },
      {
        onSuccess: () => {
          showNotification({
            title: 'Sessão atualizada',
            message: 'As alterações foram salvas com sucesso.',
            color: 'green',
          });
          onClose();
        },
      },
    );
  }

  return (
    <Modal.Root opened={opened} onClose={onClose} size="500px">
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Stack gap={1} w="100%">
            <Group justify="space-between">
              <Modal.Title>Editar Sessão</Modal.Title>
              <Modal.CloseButton />
            </Group>
            <Text c="dimmed" size="sm">
              Altere os campos abaixo para editar a sessão de estudos.
            </Text>
          </Stack>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack>
              <TextInput
                label="Título"
                placeholder="Digite o título da sessão"
                radius="sm"
                required
                {...form.getInputProps('title')}
              />

              <Textarea
                label="Descrição"
                placeholder="Descreva a sessão"
                radius="sm"
                minRows={3}
                {...form.getInputProps('description')}
              />

              <DateTimePicker
                leftSection={<IconCalendar size={18} />}
                label="Data Planejada"
                placeholder="Insira a data que planeja executar essa sessão"
                valueFormat="DD MMM YYYY hh:mm"
                required
                {...form.getInputProps('planned_date')}
              />

              <TimePicker
                leftSection={<IconClock size={16} />}
                label="Duração da Sessão"
                required
                {...form.getInputProps('session_duration')}
              />

              <Group justify="flex-end" mt="md">
                <Button variant="light" radius="sm" onClick={onClose}>
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  radius="sm"
                  loading={updateMutation.isPending}
                  disabled={!form.isValid()}
                >
                  Salvar
                </Button>
              </Group>
            </Stack>
          </form>
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
}
