import { createFileRoute, redirect } from '@tanstack/react-router';
import { fetchMe } from '@/features/auth/api';
import SessionExecution from '@/features/session/components/session-execution';

export const Route = createFileRoute('/sessions/$id')({
  beforeLoad: async () => {
    try {
      const student = await fetchMe();
      return { student };
    } catch (error) {
      throw redirect({ to: '/login' });
    }
  },
  component: SessionExecution,
});
