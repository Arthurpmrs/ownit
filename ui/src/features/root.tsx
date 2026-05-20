import { useLogout, useMe } from '@/features/auth/hooks';
import { Button, Flex, Group, Loader, Text } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Link, Outlet, useNavigate } from '@tanstack/react-router';

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
    <>
      <Flex align="center" justify="space-between" p="sm">
        <Flex gap="sm">
          <Link to="/">Home</Link>
          <Link to="/goals">Goals</Link>
        </Flex>

        <div>
          {isLoadingMe ? (
            <Loader size="sm" />
          ) : user ? (
            <Group gap="md">
              <Text size="sm">{user.email}</Text>
              <Button
                variant="light"
                size="xs"
                onClick={handleLogout}
                loading={logoutMutation.isPending}
              >
                Logout
              </Button>
            </Group>
          ) : (
            <Link to="/login">
              <Button variant="light" size="xs">
                Login
              </Button>
            </Link>
          )}
        </div>
      </Flex>
      <hr />
      <Outlet />
    </>
  );
}
