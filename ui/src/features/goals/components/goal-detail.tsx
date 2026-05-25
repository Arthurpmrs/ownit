import Header from '@/features/appshell/header';
import { Center, Container, Group, Text } from '@mantine/core';
import { BookOpenIcon } from '@phosphor-icons/react';

export default function GoalDetails() {
  return (
    <>
      <Header
        title="{goal.title}"
        description="{goal.description}"
        icon={<BookOpenIcon weight="bold" color="white" size={32} />}
      >
        <Group gap="sm">
          <>{'{métricas}'}</>
        </Group>
      </Header>

      <Container py="xl" w="100%" fluid>
        <Center py="lg">
          <Text c="dimmed">Imagine a página do plano aqui.</Text>
        </Center>
      </Container>
    </>
  );
}
