import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';

export default async function Page() {
  const session = await auth.api.getSession({ headers: await headers() });
  redirect(session ? '/dashboard/overview' : '/auth/sign-in');
}
