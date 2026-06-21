import { createFileRoute, redirect } from '@tanstack/react-router';

import { fetchMe } from '@/features/auth/api';
import Plan from '@/features/goal/components/plan';

export const Route = createFileRoute('/goals/$id')({
  beforeLoad: async () => {
    try {
      const student = await fetchMe();
      return { student };
    } catch (error) {
      throw redirect({ to: '/login' });
    }
  },
  component: Plan,
});
