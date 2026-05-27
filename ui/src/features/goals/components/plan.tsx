import Header from '@/features/appshell/header';
import { Container } from '@mantine/core';
import { BookOpenIcon } from '@phosphor-icons/react';

export default function Plan() {

  // TODO: Utilizar o id para buscar o plano correto na API (ex: useQuery)
  // const { data: goal, isLoading } = useQuery(getGoalByIdOptions(id));
  
  // mock
  const goal = { title: 'Meu Plano de Estudo', description: 'Descrição do plano de estudo' };

  return (
    <>
      <Header
        title={goal?.title || 'Carregando...'}
        description={goal?.description || 'Detalhes do plano de estudo'}
        icon={<BookOpenIcon weight="bold" color="white" size={32} />}
      />

      <Container py="xl">
        <h1>oi</h1>
      </Container>
    </>
  );
}
