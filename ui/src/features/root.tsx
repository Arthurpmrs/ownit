import { Box, Flex } from '@mantine/core';
import { Outlet } from '@tanstack/react-router';
import Navbar from './appshell/navbar';

export default function RootLayout() {
  return (
    <Flex direction="column" mih="100vh">
      <Navbar />
      <Box bg="bgLight.0" flex={1}>
        <Outlet />
      </Box>
    </Flex>
  );
}
