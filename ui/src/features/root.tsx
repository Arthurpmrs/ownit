import { Box, Flex } from '@mantine/core';
import { Link, Outlet } from '@tanstack/react-router';

export default function RootLayout() {
  return (
    <Flex direction="column" mih="100vh">
      <div className="p-2 flex gap-2">
        <Link to="/" className="[&.active]:font-bold">
          Home
        </Link>{' '}
        <Link to="/goals" className="[&.active]:font-bold">
          Goals
        </Link>{' '}
      </div>

      <Box bg="bgLight.0" flex={1}>
        <Outlet />
      </Box>
    </Flex>
  );
}
