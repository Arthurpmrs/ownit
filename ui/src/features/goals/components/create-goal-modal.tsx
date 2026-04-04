import {
  Alert,
  Button,
  Group,
  Modal,
  NumberInput,
  Select,
  Stack,
  TextInput,
  Textarea,
} from '@mantine/core';
import { useForm } from '@mantine/form';
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

  const form = useForm<CreateGoalData>({
    initialValues: {
      student_id: studentId,
      title: '',
      description: '',
      goal_type: '',
      rating: 5,
    },
    validate: {
      title: (value: string) =>
        value.length < 3 ? 'Título deve ter pelo menos 3 caracteres' : null,
      goal_type: (value: string) =>
        !value ? 'Selecione um tipo de meta' : null,
      rating: (value: number) =>
        value < 1 || value > 10 ? 'Avaliação deve ser entre 1 e 10' : null,
    },
  });

  const createGoalMutation = useCreateGoal(studentId);

  const handleSubmit = (values: CreateGoalData) => {
    createGoalMutation.mutate(values, {
      onSuccess: () => {
        form.reset();
      },
    });
  };

  return (
    <>
      <Button disabled={disabled} onClick={() => setIsModalOpen(true)}>
        + Nova Meta
      </Button>
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Criar Nova Meta"
        size="md"
      >
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Stack>
            <TextInput
              label="Título"
              placeholder="Digite o título da meta"
              required
              {...form.getInputProps('title')}
            />

            <Textarea
              label="Descrição"
              placeholder="Descreva sua meta (opcional)"
              minRows={3}
              {...form.getInputProps('description')}
            />

            <Select
              label="Tipo de Meta"
              placeholder="Selecione o tipo"
              required
              data={[
                { value: 'academic', label: 'Acadêmica' },
                { value: 'personal', label: 'Pessoal' },
                { value: 'professional', label: 'Profissional' },
                { value: 'health', label: 'Saúde' },
                { value: 'financial', label: 'Financeira' },
              ]}
              {...form.getInputProps('goal_type')}
            />

            <NumberInput
              label="Avaliação Inicial"
              description="De 1 a 10, como você avalia esta meta?"
              min={1}
              max={10}
              required
              {...form.getInputProps('rating')}
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
                variant="default"
                onClick={() => setIsModalOpen(false)}
                disabled={createGoalMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                loading={createGoalMutation.isPending}
                disabled={!form.isValid()}
              >
                Criar Meta
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </>
  );
}
