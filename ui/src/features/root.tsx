import { useLogout, useMe } from '@/features/auth/hooks';
import { Box, Flex } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Outlet, useNavigate } from '@tanstack/react-router';
import Navbar from './appshell/navbar';

export default function RootLayout() {
  const { data: user, isLoading: isLoadingMe } = useMe();
  const navigate = useNavigate();
  const logoutMutation = useLogout();

  async function handleLogout() {
    try {
      await logoutMutation.mutateAsync();
      notifications.show({
        title: 'Logout realizado',
        message: 'Você foi desconectado',
        color: 'green',
        autoClose: 3000,
      });
      await navigate({ to: '/login' });
    } catch (error) {
      notifications.show({
        title: 'Erro',
        message: 'Erro ao fazer logout',
        color: 'red',
      });
    }
  }

  return (
    <Flex direction="column" mih="100vh">
      <Navbar />
      <Box bg="bgLight.0" flex={1}>
        <Outlet />
      </Box>
    </Flex>
  );
}
