import {
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
  Textarea,
} from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { showNotification } from '@mantine/notifications';
import { PlusIcon } from '@phosphor-icons/react';
import { useState } from 'react';

interface CreateSessionModalProps {
  onSessionCreate: (session: SessionFormValues) => void;
}

interface SessionFormValues {
  title: string;
  description: string;
  start_time: Date | null;
  end_time: Date | null;
  duration: number;
  duration_focused: number;
  duration_paused: number;
}

export default function CreateSessionModal({
  onSessionCreate,
}: CreateSessionModalProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const form = useForm<SessionFormValues>({
    initialValues: {
      title: '',
      description: '',
      start_time: null,
      end_time: null,
      duration: 30,
      duration_focused: 0,
      duration_paused: 0,
    },
    validate: {
      duration: (value) =>
        value < 1 ? 'Duração deve ser pelo menos 1 minuto' : null,
      end_time: (value, values) => {
        if (!value || !values.start_time) {
          return null;
        }
        if (value <= values.start_time) {
          return 'Data de término deve ser maior que a data de início';
        }
        return null;
      },
    },
  });

  function handleSubmit(values: SessionFormValues) {
    onSessionCreate(values);

    showNotification({
      title: 'Sessão criada',
      message: 'Sua sessão foi criada com sucesso.',
      color: 'green',
    });

    setIsModalOpen(false);
    form.reset();
  }

  return (
    <>
      <Button
        variant="subtle"
        size="xs"
        leftSection={<PlusIcon size={16} />}
        onClick={() => setIsModalOpen(true)}
      >
        Adicionar
      </Button>

      <Modal.Root
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        size="450px"
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
                Utilize os campos abaixo para inciar a criação de uma sessão de estudos.
              </Text>
            </Stack>
          </Modal.Header>
          <Modal.Body>
            <form onSubmit={form.onSubmit(handleSubmit)}>
              <Stack>
                <TextInput
                  label="Título"
                  placeholder="Insira um título"
                  radius="sm"
                  required
                  {...form.getInputProps('title')}
                />

                <Textarea
                  label="Descrição"
                  placeholder="Insira uma descrição"
                  radius="sm"
                  required
                  minRows={2}
                  {...form.getInputProps('description')}
                />

                <DatePickerInput 
                  label="Data de ínicio planejada"
                  placeholder="Selecione data"
                  radius="sm"
                  required
                  {...form.getInputProps('start_time')}
                />

                <DatePickerInput 
                  label="Data de término planejada"
                  placeholder="Selecione data"
                  radius="sm"
                  required
                  {...form.getInputProps('end_time')}
                />

                <NumberInput
                  label="Duração da Sessão"
                  placeholder="03:30"
                  radius="sm"
                  min={1}
                  max={480}
                  required
                  {...form.getInputProps('duration')}
                />

                <NumberInput
                  label="Duração do Modo Foco"
                  placeholder="00:50"
                  radius="sm"
                  min={1}
                  max={480}
                  {...form.getInputProps('duration_focused')}
                />

                <NumberInput
                  label="Duração do Modo Pause"
                  placeholder="00:15"
                  radius="sm"
                  min={1}
                  max={480}
                  {...form.getInputProps('duration_paused')}
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
                    Salvar
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