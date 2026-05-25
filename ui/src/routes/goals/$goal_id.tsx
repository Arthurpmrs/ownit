import { createFileRoute, redirect } from '@tanstack/react-router';

import { fetchMe } from '@/features/auth/api';
import GoalDetails from '@/features/goals/components/goal-detail';

export const Route = createFileRoute('/goals/$goal_id')({
  beforeLoad: async () => {
    try {
      const student = await fetchMe();
      return { student };
    } catch (error) {
      throw redirect({ to: '/login' });
    }
  },
  component: GoalDetails,
});
