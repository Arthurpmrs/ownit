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

import { useLogin } from '@/features/auth/hooks';

export default function Login() {
  const navigate = useNavigate();
  const loginMutation = useLogin();

  const form = useForm({
    mode: 'uncontrolled',
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (value) => (!value ? 'Email é obrigatório' : null),
      password: (value) =>
        !value || value.length < 3
          ? 'Senha deve ter ao menos 3 caracteres'
          : null,
    },
  });

  async function handleSubmit(values: typeof form.values) {
    try {
      await loginMutation.mutateAsync(values);

      notifications.show({
        title: 'Sucesso!',
        message: 'Login realizado com sucesso',
        color: 'green',
        autoClose: 3000,
      });

      await navigate({ to: '/' });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Erro ao fazer login';
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
            Login
          </Title>

          {loginMutation.error && (
            <Alert color="red" title="Erro no login">
              {loginMutation.error.message}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
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
                loading={loginMutation.isPending}
                disabled={loginMutation.isPending}
              >
                {loginMutation.isPending ? 'Entrando...' : 'Entrar'}
              </Button>
            </Stack>
          </form>

          <Box ta="center" size="sm">
            <p>
              Não tem conta?{' '}
              <Link to="/signup" className="hover:underline">
                <span style={{ color: '#0066ff' }}>Criar conta</span>
              </Link>
            </p>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
