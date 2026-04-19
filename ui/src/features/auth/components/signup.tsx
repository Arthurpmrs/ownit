import {
  Alert,
  Box,
  Button,
  Container,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { Link, useNavigate } from '@tanstack/react-router';

import { useSignup } from '@/features/auth/hooks';

export default function Signup() {
  const navigate = useNavigate();
  const signupMutation = useSignup();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
      name: '',
    },
    validate: {
      email: (value) =>
        !value || !value.includes('@') ? 'Email válido é obrigatório' : null,
      password: (value) =>
        !value || value.length < 3
          ? 'Senha deve ter ao menos 3 caracteres'
          : null,
      name: (value) => (!value ? 'Nome é obrigatório' : null),
    },
  });

  async function handleSubmit(values: typeof form.values) {
    try {
      await signupMutation.mutateAsync({
        email: values.email,
        password: values.password,
        name: values.name,
      });

      notifications.show({
        title: 'Sucesso!',
        message: 'Conta criada com sucesso. Você está autenticado!',
        color: 'green',
        autoClose: 3000,
      });

      await navigate({ to: '/' });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao criar conta';
      notifications.show({
        title: 'Erro',
        message,
        color: 'red',
        autoClose: 5000,
      });
    }
  }

  return (
    <Container size="xs" py="xl">
      <Paper radius="md" p="xl" withBorder>
        <Stack gap="lg">
          <Title order={2} ta="center">
            Criar Conta
          </Title>

          {signupMutation.error && (
            <Alert color="red" title="Erro no cadastro">
              {signupMutation.error.message}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Nome"
                placeholder="Seu nome completo"
                key={form.key('name')}
                {...form.getInputProps('name')}
              />

              <TextInput
                label="Email"
                placeholder="seu@email.com"
                key={form.key('email')}
                {...form.getInputProps('email')}
              />

              <PasswordInput
                label="Senha"
                placeholder="Sua senha"
                key={form.key('password')}
                {...form.getInputProps('password')}
              />

              <Button
                type="submit"
                fullWidth
                loading={signupMutation.isPending}
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </Stack>
          </form>

          <Box ta="center" size="sm">
            <p>
              Já tem conta?{' '}
              <Link to="/login" className="hover:underline">
                <span style={{ color: '#0066ff' }}>Fazer login</span>
              </Link>
            </p>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
