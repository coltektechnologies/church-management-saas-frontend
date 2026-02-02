import FeatureCard from "./FeatureCard";

export default function FeaturesSection() {
  return (
    <section className="max-w-6xl mx-auto px-6 py-24 space-y-12">
      <FeatureCard
        title="The Secretariat Module"
        summary="Experience a unified directory where member profiles, attendance trends, and departmental growth are managed in real-time."
        details={
          <>
            <p className="font-semibold mb-2">Unified Directory</p>
            <p className="mb-4">
              Centralize all member data including baptismal records, family relations,
              and contact histories.
            </p>

            <p className="font-semibold mb-2">Attendance Tracking</p>
            <p>
              Record weekly service attendance and mid-week prayer meeting participation
              to identify engagement trends early.
            </p>
          </>
        }
      />
      <FeatureCard
        title="The Treasury Module"
        summary="Form automated tithe recording to digital expense approvals, our treasury tools ensure complete transparency for your congregation."
        details={
          <>
            <p className="font-semibold mb-2">Unified Directory</p>
            <p className="mb-4">
              Centralize all member data including baptismal records, family relations,
              and contact histories.
            </p>

            <p className="font-semibold mb-2">Attendance Tracking</p>
            <p>
              Record weekly service attendance and mid-week prayer meeting participation
              to identify engagement trends early.
            </p>
          </>
        }
      />
      <FeatureCard
        title="Automated Communications"
        summary="Reach your members instantly via automated SMS and email notification for announcements, reminders and emergencies."
        details={
          <>
            <p className="font-semibold mb-2">Unified Directory</p>
            <p className="mb-4">
              Centralize all member data including baptismal records, family relations,
              and contact histories.
            </p>

            <p className="font-semibold mb-2">Attendance Tracking</p>
            <p>
              Record weekly service attendance and mid-week prayer meeting participation
              to identify engagement trends early.
            </p>
          </>
        }
      />
      <FeatureCard
        title="Multi-Department Coordination"
        summary="Empower department heads with dedicated dashboards to manage their own budgets, events and member lists independently"
        details={
          <>
            <p className="font-semibold mb-2">Unified Directory</p>
            <p className="mb-4">
              Centralize all member data including baptismal records, family relations,
              and contact histories.
            </p>

            <p className="font-semibold mb-2">Attendance Tracking</p>
            <p>
              Record weekly service attendance and mid-week prayer meeting participation
              to identify engagement trends early.
            </p>
          </>
        }
      />
      <FeatureCard
        title="Analytics Dashboard"
        summary="Visualize church health and growth with interactive charts that monitor membership trends, finacial health and overall demographic shifts."
        details={
          <>
            <p className="font-semibold mb-2">Unified Directory</p>
            <p className="mb-4">
              Centralize all member data including baptismal records, family relations,
              and contact histories.
            </p>

            <p className="font-semibold mb-2">Attendance Tracking</p>
            <p>
              Record weekly service attendance and mid-week prayer meeting participation
              to identify engagement trends early.
            </p>
          </>
        }
      />

      {/* Repeat cards for other modules */}
    </section>
  );
}
