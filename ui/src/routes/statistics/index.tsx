import { createFileRoute, redirect } from '@tanstack/react-router';

import { fetchMe } from '@/features/auth/api';
import Statistics from '@/features/statistics/components/statistics';

export const Route = createFileRoute('/statistics/')({
  beforeLoad: async () => {
    try {
      const student = await fetchMe();
      return { student };
    } catch (error) {
      throw redirect({ to: '/login' });
    }
  },
  component: Statistics,
});
