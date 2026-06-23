import { createFileRoute, redirect } from '@tanstack/react-router';

import Home from '@/features/home';

export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({
      to: '/goals',
      replace: true,
    });
  },
  component: Home,
});
