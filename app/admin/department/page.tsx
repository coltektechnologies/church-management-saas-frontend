import { redirect } from 'next/navigation';

/** Alias for bookmarked / mistyped singular path */
export default function AdminDepartmentAliasPage() {
  redirect('/admin/departments');
}
