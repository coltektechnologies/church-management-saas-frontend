import FeatureCard from './FeatureCard';

/** Unsplash — free for commercial use; see https://unsplash.com/license */
const IMG = {
  secretariat:
    'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1400&q=85',
  treasury:
    'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?auto=format&fit=crop&w=1400&q=85',
  communication:
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1400&q=85',
  coordination:
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=85',
  analytics:
    'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85',
} as const;

export default function FeaturesSection() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-28 space-y-16">
      <FeatureCard
        title="The Secretariat Module"
        imageUrl={IMG.secretariat}
        imageAlt="Bright modern office workspace representing church administration and secretariat"
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
        imageUrl={IMG.treasury}
        imageAlt="Professional finance and accounting workspace representing treasury and stewardship"
        summary="From automated tithe recording to digital expense approvals, our treasury tools ensure complete transparency for your congregation"
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
        imageUrl={IMG.communication}
        imageAlt="Mobile messaging and digital communication representing automated church notifications"
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
        imageUrl={IMG.coordination}
        imageAlt="Diverse team collaborating around a table representing multi-department coordination"
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
        imageUrl={IMG.analytics}
        imageAlt="Analytics charts and data visualization on screen representing church health insights"
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
