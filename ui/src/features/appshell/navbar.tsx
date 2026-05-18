import { Button, Center, Group, Image } from '@mantine/core';
import { Link, useMatchRoute } from '@tanstack/react-router';

export default function Navbar() {
  const matchRoute = useMatchRoute();

  return (
    <Group
      component="nav"
      aria-label="Navegação Principal"
      px={{ base: 'md', md: '4rem' }}
      py="xs"
      style={{ borderBottom: '1px solid var(--mantine-color-borderLight-0)' }}
    >
      <Center>
        <Image src="/assets/ownit-logo.svg" alt="Ownit Logo" w={133} h={46} />
      </Center>
      <Group gap="sm" flex={1} justify="center">
        <Button
          component={Link}
          to="/goals"
          variant={matchRoute({ to: '/goals' }) ? 'filled' : 'subtle'}
        >
          Planos
        </Button>

        <Button
          component={Link}
          to="/statistics"
          variant={matchRoute({ to: '/statistics' }) ? 'filled' : 'subtle'}
        >
          Estatísticas
        </Button>
      </Group>
    </Group>
  );
}
