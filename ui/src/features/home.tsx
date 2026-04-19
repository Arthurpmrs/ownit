import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { Link } from '@tanstack/react-router';

import { useMe } from '@/features/auth/hooks';

export default function Home() {
  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <div>
          <Title order={1}>Bem-vindo ao Ownit!</Title>
          <Text c="dimmed" mt="sm" size="lg">
            Sistema de gerenciamento de metas e objetivos
          </Text>
        </div>

        <HomeContent />
      </Stack>
    </Container>
  );
}

function HomeContent() {
  const { data: user, isAuthenticated, isLoading } = useMe();

  if (isLoading) {
    return <Text>Verificando autenticação...</Text>;
  }

  if (isAuthenticated) {
    return <AuthenticatedHome user={user} />;
  }

  return <AnonymousHome />;
}

function AuthenticatedHome({ user }: { user: any }) {
  return (
    <Stack gap="lg">
      <Card withBorder p="lg" radius="md">
        <Stack gap="md">
          <Group justify="space-between">
            <div>
              <Text fw={600} size="lg">
                Olá, {user?.name || user?.email}! 👋
              </Text>
              <Text c="dimmed" size="sm">
                Email: {user?.email}
              </Text>
            </div>
            <Badge size="lg" variant="light" color="green">
              Autenticado
            </Badge>
          </Group>

          <Text c="dimmed">
            Você está autenticado e pode acessar todas as funcionalidades do
            sistema.
          </Text>

          <Link to="/goals">
            <Button fullWidth size="md" mt="md">
              Ir para Minhas Metas
            </Button>
          </Link>
        </Stack>
      </Card>
    </Stack>
  );
}

function AnonymousHome() {
  return (
    <Stack gap="lg">
      <Card withBorder p="lg" radius="md" bg="blue.0">
        <Stack gap="md">
          <Title order={2}>Comece agora!</Title>
          <Text c="dimmed">
            Crie sua conta ou faça login para começar a gerenciar suas metas.
          </Text>

          <Group grow>
            <Link to="/login">
              <Button variant="filled" size="md" fullWidth>
                Fazer Login
              </Button>
            </Link>
            <Link to="/signup">
              <Button variant="light" size="md" fullWidth>
                Criar Conta
              </Button>
            </Link>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
