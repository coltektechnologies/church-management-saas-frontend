'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import NotificationTab from '@/components/admin/dashboardsettings/superadmin/NotificationTab';

export default function SuperadminNotificationsSettingsPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in duration-500">
      <Link
        href="/admin/settings/superadmin"
        className="inline-flex items-center gap-2 text-[13px] font-semibold text-muted-foreground hover:text-[color:var(--primary-brand)] dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={15} /> Back to Settings
      </Link>
      <NotificationTab />
    </div>
  );
}
