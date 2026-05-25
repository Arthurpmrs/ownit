import {
  Alert,
  Box,
  Button,
  Container,
  createTheme,
  Checkbox,
  Divider,
  Image,
  Paper,
  PasswordInput,
  Stack,
  TextInput,
  Text,
  MantineProvider,
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
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Nome deve ter ao menos 2 caracteres' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Email inválido'),
      password: (value) =>
        value.length < 3 ? 'Senha deve ter ao menos 3 caracteres' : null,
      confirmPassword: (value, values) =>
        value !== values.password ? 'As senhas não conferem' : null,
    },
  });

  async function handleSubmit(values: typeof form.values) {
    try {
      // Removemos o confirmPassword antes de enviar para a API
      const { confirmPassword, ...signupData } = values;
      await signupMutation.mutateAsync(signupData);

      notifications.show({
        title: 'Sucesso!',
        message: 'Conta criada com sucesso! Faça login para continuar.',
        color: 'green',
        autoClose: 3000,
      });

      await navigate({ to: '/login' });
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

  const theme = createTheme({
    cursorType: 'pointer',
  });

  return (
    <Container size="md" py="xl" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
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
            <Image src="/assets/ownit-logo.svg" alt="Ownit Logo" w={290} h={100} m="auto"/>
          </Box>
          <Text size="sm" ta="center" style={{color: '#868E96'}}>
            Sua plataforma de <b>Self Regulated Learning</b>. Preencha os dados para começar.
          </Text>

          {signupMutation.error && (
            <Alert color="red" title="Erro no cadastro">
              {signupMutation.error.message}
            </Alert>
          )}

          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <TextInput
                label="Nome Completo"
                placeholder="Seu nome"
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
                placeholder="$ua$3nha"
                key={form.key('password')}
                {...form.getInputProps('password')}
              />

              <PasswordInput
                label="Confirmar Senha"
                placeholder="$ua$3nha"
                key={form.key('confirmPassword')}
                {...form.getInputProps('confirmPassword')}
              />

            <MantineProvider theme={theme}>
              <Checkbox
                label="Eu concordo com os Termos de Uso e Políticas de Privacidade"
                defaultChecked={false}
                key={form.key('terms')}
                {...form.getInputProps('terms')}
              />
            </MantineProvider>

              <Button
                type="submit"
                fullWidth
                loading={signupMutation.isPending}
                disabled={signupMutation.isPending}
                mt="md"
              >
                {signupMutation.isPending ? 'Criando conta...' : 'Criar Conta'}
              </Button>
            </Stack>
          </form>

          <Divider
            my="md"
            label={<Text size="sm" c="dimmed" px="xs" fw={400}>ou</Text>}
            labelPosition="center"
            color="#FCA13A"
          />

          <Box ta="center">
            <p>
              Já tem uma conta?{' '}
              <Link to="/login" style={{ textDecoration: 'none' }}>
                <span style={{ color: '#FCA13A', fontWeight: 'bold'}}>Fazer Login</span>
              </Link>
            </p>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
