import { Center, Group, Stack, Text, Title } from '@mantine/core';
import type { ReactNode } from 'react';

interface HeaderProps {
  title: string;
  description: ReactNode;
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
      wrap="nowrap"
      style={{ borderBottom: '1px solid var(--mantine-color-borderLight-0)' }}
    >
      <Group wrap="nowrap">
        <Center
          bg="orange.6"
          style={{ borderRadius: 'var(--mantine-radius-lg)' }}
          p="xs"
        >
          {icon}
        </Center>
        <Stack gap="2px" justify="center" align="flex-start">
          <Title size="h3" lineClamp={2}>
            {title}
          </Title>
          <Text c="dimmed" size="xs" component="span">
            {description}
          </Text>
        </Stack>
      </Group>
      <Group gap="lg">{children}</Group>
    </Group>
  );
}
