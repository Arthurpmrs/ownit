import { Center, Group, Image } from '@mantine/core';
import { Link } from '@tanstack/react-router';
import AvatarMenu from './avatar-menu';

export default function Navbar() {
  return (
    <Group
      justify="space-between"
      align="center"
      component="nav"
      aria-label="Navegação Principal"
      px={{ base: 'md', md: '4rem' }}
      py="xs"
      style={{ borderBottom: '1px solid var(--mantine-color-borderLight-0)' }}
    >
      <Center>
        <Link to="/goals">
          <Image src="/assets/ownit-logo.svg" alt="Ownit Logo" w={133} h={46} />
        </Link>
      </Center>
      <Center>
        <AvatarMenu />
      </Center>
    </Group>
  );
}
