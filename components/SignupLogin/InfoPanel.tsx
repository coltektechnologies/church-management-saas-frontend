import { Users, Megaphone, BarChart3 } from 'lucide-react';

/**
 * InfoPanel - Visual branding and feature highlights.
 */
const InfoPanel = () => {
  const features = [
    {
      icon: Users,
      title: 'Manage members',
      desc: 'Keep member records up to date, assign departments, and manage your church structure with ease.',
    },
    {
      icon: Megaphone,
      title: 'Create announcements',
      desc: 'Create, approve, and publish announcements and church programs to the right people at the right time.',
    },
    {
      icon: BarChart3,
      title: 'View financial report',
      desc: 'Record income and expenses, track assets, and generate financial reports with transparency.',
    },
  ];

  return (
    <div className="bg-[#0A1D37] p-8 lg:p-12 text-white h-full flex flex-col justify-center rounded-l-[20px]">
      <h1
        className="mb-4"
        style={{
          fontWeight: 800,
          fontSize: '25px',
          lineHeight: '100%',
          letterSpacing: '0%',
          color: '#FFFFFF',
        }}
      >
        Create your Open Door <br /> church account.
      </h1>

      <p
        className="mb-12"
        style={{
          fontFamily: 'Poppins, sans-serif',
          fontWeight: 400,
          fontSize: '14px',
          lineHeight: '100%',
          letterSpacing: '0%',
          color: '#2FC4B2',
        }}
      >
        Start with a 14-day free trial and upgrade anytime <br className="hidden lg:block" />
        as your church grows.
      </p>

      {/* Feature List */}
      <div className="space-y-10">
        {features.map((f) => (
          <div key={f.title} className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <f.icon size={24} style={{ color: '#2FC4B2' }} />
              <h3
                style={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: '18px',
                  lineHeight: '100%',
                  letterSpacing: '0%',
                  color: '#FFFFFF',
                }}
              >
                {f.title}
              </h3>
            </div>

            {/* Description */}
            <p
              style={{
                fontFamily: 'Poppins, sans-serif',
                fontWeight: 400,
                fontSize: '14px',
                lineHeight: '1.4',
                letterSpacing: '0%',
                color: '#2FC4B2',
              }}
            >
              {f.desc}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoPanel;
