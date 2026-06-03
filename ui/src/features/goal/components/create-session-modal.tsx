import {
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

export interface SessionFormValues {
  title: string;
  description: string;
  planned_date: Date | null;
  session_duration: string;
  focus_duration: string;
  pause_duration: string;
}

interface CreateSessionModalProps {
  onSessionCreate: (session: SessionFormValues) => void;
}

export default function CreateSessionModal({ onSessionCreate }: CreateSessionModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [moreSession, setMoreSession] = useState(false);
  const openModal = () => setIsModalOpen(true);

  const form = useForm<SessionFormValues>({
    initialValues: {
      title: '',
      description: '',
      planned_date: null,
      session_duration: '',
      focus_duration: '00:50',
      pause_duration: '00:15',
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

  function handleSubmit(values: SessionFormValues) {
    onSessionCreate(values);

    showNotification({
      title: 'Sessão criada',
      message: 'Sua sessão foi criada com sucesso.',
      color: 'green',
    });

    if (moreSession) {
      form.reset();
    } else {
      form.reset();
      setIsModalOpen(false);
    }
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
                    {...form.getInputProps('pause_duration')}
                  />
                </Group>

                {/* {createGoalMutation.isError && (
                  <Alert color="red" title="Erro ao criar plano">
                    {createGoalMutation.error instanceof Error
                      ? createGoalMutation.error.message
                      : 'Erro desconhecido'}
                  </Alert>
                )} */}

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
