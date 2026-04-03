import { createFileRoute } from '@tanstack/react-router';

import Goals from '@/features/goals/components/goals';

export const Route = createFileRoute('/goals/')({
  component: Goals,
});
