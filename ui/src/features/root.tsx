import { Box, Flex } from '@mantine/core';
import { Outlet, useLocation } from '@tanstack/react-router';
import Navbar from './appshell/navbar';

import ChatPopup from './chat/components/ChatPopup';

export default function RootLayout() {
  const location = useLocation();
  const isAuthPage = ['/login', '/signup'].includes(location.pathname);

  return (
    <Flex direction="column" mih="100vh">
      {!isAuthPage && <Navbar />}
      <Box bg="bgLight.0" flex={1}>
        <Outlet />
      </Box>
      <ChatPopup />
    </Flex>
  );
}
