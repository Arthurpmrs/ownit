import {
  Alert,
  Box,
  Button,
  Container,
  Divider,
  Group,
  Image,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Text,
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
    <Container
      size="md"
      py="xl"
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Paper
        radius="md"
        p={60}
        withBorder
        style={{
          minHeight: '70vh',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <Stack gap="lg">
          <Box>
            <Image
              src="/assets/ownit-logo.svg"
              alt="Ownit Logo"
              w={290}
              h={100}
              m="auto"
            />
          </Box>
          <Text size="sm" ta="center" style={{ color: '#868E96' }}>
            Sua plataforma de <b>Self Regulated Learning</b>. Entre para
            continuar sua jornada de aprendizado.
          </Text>

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
                placeholder="$ua$3nha"
                key={form.key('password')}
                {...form.getInputProps('password')}
              />

              <Box ta="right">
                <Link to="/forgot-password" style={{ textDecoration: 'none' }}>
                  <span
                    style={{
                      color: '#FC8A08',
                      fontSize: '0.9em',
                      fontWeight: 'bolder',
                    }}
                  >
                    Esqueceu a senha?
                  </span>
                </Link>
              </Box>

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

          <Divider
            my="md"
            label={
              <Text size="sm" c="dimmed" px="xs" fw={400}>
                ou
              </Text>
            }
            labelPosition="center"
            color="#FCA13A"
          />

          <Box ta="center" size="sm">
            <p>
              Não tem conta?{' '}
              <Link to="/signup" style={{ textDecoration: 'none' }}>
                <span style={{ color: '#FCA13A', fontWeight: 'bold' }}>
                  Criar conta grátis
                </span>
              </Link>
            </p>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
