'use client';

import AdminReportsHub from '@/components/admin/reports/AdminReportsHub';

/** Treasury-focused finance reports (same tiles as member treasury `/treasury/reports`). */
export default function AdminTreasuryReportsPage() {
  return <AdminReportsHub variant="treasury" />;
}
