import FeatureCard from './FeatureCard';

export default function FeaturesSection() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-28 space-y-16">
      <FeatureCard
        title="The Secretariat Module"
        summary="Experience a unified directory where member profiles, attendance trends, and departmental growth are managed in real-time."
        details={
          <>
            <p className="font-medium mb-3">Unified Directory</p>
            <p className="mb-6">
              Centralize all member data including baptismal records, family relations, and contact
              histories.
            </p>

            <p className="font-medium mb-3">Attendance Tracking</p>
            <p>
              Record weekly service attendance and mid-week prayer meeting participation to identify
              engagement trends early.
            </p>
          </>
        }
      />
      <FeatureCard
        title="The Treasury Module"
        summary="From automated tithe recording to digital expense approvals, our tresury tools ensure complete transparency for your congregation"
        details={
          <>
            <p className="font-medium mb-3">Unified Directory</p>
            <p className="mb-6">
              Centralize all member data including baptismal records, family relations, and contact
              histories.
            </p>

            <p className="font-medium mb-3">Attendance Tracking</p>
            <p>
              Record weekly service attendance and mid-week prayer meeting participation to identify
              engagement trends early.
            </p>
          </>
        }
      />
      <FeatureCard
        title="Automated Communication"
        summary="Reach your members instantly via automated SMS and email notifications for announcements, reminders and emergencies."
        details={
          <>
            <p className="font-medium mb-3">Unified Directory</p>
            <p className="mb-6">
              Centralize all member data including baptismal records, family relations, and contact
              histories.
            </p>

            <p className="font-medium mb-3">Attendance Tracking</p>
            <p>
              Record weekly service attendance and mid-week prayer meeting participation to identify
              engagement trends early.
            </p>
          </>
        }
      />
      <FeatureCard
        title="Multi-Department Coordination"
        summary="Empower department heads with dedicated dashboards to manage their own budgets, events and member lists independently."
        details={
          <>
            <p className="font-medium mb-3">Unified Directory</p>
            <p className="mb-6">
              Centralize all member data including baptismal records, family relations, and contact
              histories.
            </p>

            <p className="font-medium mb-3">Attendance Tracking</p>
            <p>
              Record weekly service attendance and mid-week prayer meeting participation to identify
              engagement trends early.
            </p>
          </>
        }
      />
      <FeatureCard
        title="Analytics Dashboard"
        summary="Visualize church health with interactive charts that monitor membership trends financial health and overall demographic shifts."
        details={
          <>
            <p className="font-medium mb-3">Unified Directory</p>
            <p className="mb-6">
              Centralize all member data including baptismal records, family relations, and contact
              histories.
            </p>

            <p className="font-medium mb-3">Attendance Tracking</p>
            <p>
              Record weekly service attendance and mid-week prayer meeting participation to identify
              engagement trends early.
            </p>
          </>
        }
      />
    </div>
  );
}
