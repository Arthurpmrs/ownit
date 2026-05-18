import { Center, Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  description: string;
  icon: ReactNode;
  children?: ReactNode;
}

export default function Header({
  title,
  description,
  icon,
  children,
}: HeaderProps) {
  return (
    <Group
      bg="white"
      justify="space-between"
      px="xl"
      py="md"
      style={{ borderBottom: '1px solid var(--mantine-color-borderLight-0)' }}
    >
      <Group>
        <Center
          bg="brand.5"
          style={{ borderRadius: 'var(--mantine-radius-lg)' }}
          p="xs"
        >
          {icon}
        </Center>
        <Stack gap="2px" justify="center" align="flex-start">
          <Title size="h3">{title}</Title>
          <Text c="dimmed" size="xs">
            {description}
          </Text>
        </Stack>
      </Group>
      <Group gap="lg">{children}</Group>
    </Group>
  );
}
