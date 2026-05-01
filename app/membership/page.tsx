import { redirect } from 'next/navigation';

/** Canonical profile URL is `/membership/profile`; keep `/membership` as a short entry point. */
export default function MembershipIndexPage() {
  redirect('/membership/profile');
}
