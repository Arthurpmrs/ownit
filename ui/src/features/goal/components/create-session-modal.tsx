import {
  Alert,
  Button,
  Checkbox,
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
import { CalendarBlankIcon, ClockIcon, PlusIcon } from '@phosphor-icons/react';
import { useState } from 'react';
import { useCreateStudySession } from '../hooks';
import { showNotification } from '@mantine/notifications';
import type { CreateStudySessionData } from '../models';
import { durationToIso } from '@/shared/utils';

export interface SessionFormValues {
  title: string;
  description: string;
  planned_date: Date | null;
  session_duration: string;
  focus_duration: string;
  break_duration: string;
}

export default function CreateSessionModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moreSession, setMoreSession] = useState(false);
  const openModal = () => setIsModalOpen(true);
  const goalId = '6af2702a-84b2-4cd7-8913-c31cd83e8a1a';

  const form = useForm<SessionFormValues>({
    initialValues: {
      title: '',
      description: '',
      planned_date: null,
      session_duration: '',
      focus_duration: '00:50',
      break_duration: '00:15',
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

  const createStudySessionMutation = useCreateStudySession(goalId);

  function handleSubmit(values: SessionFormValues) {
    const payload: CreateStudySessionData = {
      goal_id: goalId,
      title: values.title,
      description: values.description,
      planned_to_start_at: values.planned_date,
      duration: durationToIso(values.session_duration),
      focus_duration: durationToIso(values.focus_duration),
      break_duration: durationToIso(values.break_duration),
    };

    createStudySessionMutation.mutate(payload, {
      onSuccess: () => {
        showNotification({
          title: 'Sessão de estudo criada',
          message: 'Sua nova sessão de estudo foi criado com sucesso.',
          color: 'green',
        });
        if (moreSession) {
          form.reset();
        } else {
          form.reset();
          setIsModalOpen(false);
        }
      },
      onError: (error) => {
        showNotification({
          title: 'Erro ao criar sessão de estudo',
          message: error instanceof Error ? error.message : 'Erro desconhecido',
          color: 'red',
        });
      },
    });
  }

  return (
    <>
      <Button
        variant="subtle"
        radius="sm"
        size="sm"
        leftSection={<PlusIcon weight="bold" size={14} />}
        onClick={openModal}
      >
        Adicionar
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
                <Modal.Title>Criar Nova Sessão</Modal.Title>
                <Modal.CloseButton />
              </Group>
              <Text c="dimmed" size="sm">
                Utilize os campos abaixo para inciar a criação de uma sessão de
                estudos.
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
                  leftSection={<CalendarBlankIcon size={18} />}
                  label="Data Planejada"
                  placeholder="Insira a data que planeja executar essa sessão"
                  valueFormat="DD MMM YYYY hh:mm"
                  minDate={new Date()}
                  required
                  {...form.getInputProps('planned_date')}
                />

                <TimePicker
                  leftSection={<ClockIcon size={16} />}
                  label="Duração da Sessão"
                  required
                  {...form.getInputProps('session_duration')}
                />

                <Group>
                  <TimePicker
                    leftSection={<ClockIcon size={16} />}
                    label="Duração do Modo Foco"
                    defaultValue="00:50"
                    flex={1}
                    {...form.getInputProps('focus_duration')}
                  />
                  <TimePicker
                    leftSection={<ClockIcon size={16} />}
                    label="Duração do Modo Pause"
                    defaultValue="00:15"
                    flex={1}
                    {...form.getInputProps('break_duration')}
                  />
                </Group>

                {createStudySessionMutation.isError && (
                  <Alert color="red" title="Erro ao criar plano">
                    {createStudySessionMutation.error instanceof Error
                      ? createStudySessionMutation.error.message
                      : 'Erro desconhecido'}
                  </Alert>
                )}

                <Group justify="space-between">
                  <Checkbox
                    label="Criar Mais Sessões"
                    size="sm"
                    checked={moreSession}
                    onChange={(event) =>
                      setMoreSession(event.currentTarget.checked)
                    }
                  />
                  <Group justify="flex-end" mt="md">
                    <Button
                      variant="light"
                      radius="sm"
                      onClick={() => form.reset()}
                    >
                      Limpar
                    </Button>
                    <Button
                      type="submit"
                      radius="sm"
                      disabled={!form.isValid()}
                    >
                      Criar Sessão
                    </Button>
                  </Group>
                </Group>
              </Stack>
            </form>
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
    </>
  );
}
