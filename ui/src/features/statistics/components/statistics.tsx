import Header from '@/features/appshell/header';
import { Center, Container, Text } from '@mantine/core';
import { IconTrendingUp } from '@tabler/icons-react';

export default function Statistics() {
  return (
    <>
      <Header
        title="Meu Desempenho"
        description="Visão completa do seu desempenho em todos os planos de estudo"
        icon={<IconTrendingUp stroke={2} color="white" size={32} />}
      />

      <Container py="xl">
        <Center py="lg">
          <Text c="dimmed">Imagine um dashboard mt massa aqui.</Text>
        </Center>
      </Container>
    </>
  );
}
