import { createFileRoute, redirect } from '@tanstack/react-router';

import { fetchMe } from '@/features/auth/api';
import Goals from '@/features/goals/components/goals';

export const Route = createFileRoute('/goals/')({
  beforeLoad: async () => {
    try {
      const student = await fetchMe();
      return { student };
    } catch (error) {
      throw redirect({ to: '/login' });
    }
  },
  component: Goals,
});
