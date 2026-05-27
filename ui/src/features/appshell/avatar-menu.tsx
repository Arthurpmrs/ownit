import { Avatar, Menu } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { SignOutIcon } from '@phosphor-icons/react';
import { useNavigate } from '@tanstack/react-router';
import { useLogout, useMe } from '../auth/hooks';

export default function AvatarMenu() {
  const { data: user } = useMe();
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
    <Menu
      trigger="click-hover"
      openDelay={100}
      closeDelay={350}
      shadow="md"
      width={200}
    >
      <Menu.Target>
        <Avatar name={user?.name ?? undefined} color="initials" />
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item
          onClick={() => handleLogout()}
          color="red"
          leftSection={<SignOutIcon size={16} />}
        >
          Sair da Conta
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
