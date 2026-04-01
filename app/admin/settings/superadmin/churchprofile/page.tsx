import ChurchProfileTab from '@/components/admin/dashboardsettings/superadmin/ChurchProfileTab';

export default function ChurchProfilePage() {
  // Since we added 'export default' to ChurchProfileTab, this import now works perfectly.
  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      <ChurchProfileTab />
    </div>
  );
}
