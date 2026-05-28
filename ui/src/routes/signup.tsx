import { createFileRoute } from '@tanstack/react-router';

import Signup from '@/features/auth/components/signup';

export const Route = createFileRoute('/signup')({
  component: Signup,
});
