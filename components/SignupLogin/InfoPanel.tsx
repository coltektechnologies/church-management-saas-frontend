import { Users, Megaphone, BarChart3 } from 'lucide-react';

/**
 * InfoPanel - Visual branding and feature highlights.
 * Logic: Maps through feature data to maintain clean JSX structure.
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

  const styles = {
    container: 'bg-[#0A1D37] p-8 lg:p-12 text-white h-full flex flex-col justify-center',
    heading: 'font-ovsoge font-extrabold text-[25px] leading-tight mb-4 text-white uppercase',
    subtext: 'font-poppins font-normal text-[14px] text-[#2FC4B2] mb-12 leading-relaxed',
    featureGroup: 'space-y-10',
    item: 'flex gap-5 items-start',
    icon: 'h-6 w-6 text-[#2FC4B2] shrink-0 mt-1',
    itemTitle: 'font-poppins font-semibold text-[18px] text-white leading-none mb-2',
    itemDesc: 'font-poppins font-normal text-[14px] text-white/80 leading-relaxed',
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>
        Create your Open Door <br /> church account.
      </h1>

      <p className={styles.subtext}>
        Start with a 14-day free trial and upgrade anytime <br className="hidden lg:block" />
        as your church grows.
      </p>

      <div className={styles.featureGroup}>
        {features.map((f) => (
          <div key={f.title} className={styles.item}>
            <f.icon className={styles.icon} />
            <div>
              <h3 className={styles.itemTitle}>{f.title}</h3>
              <p className={styles.itemDesc}>{f.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InfoPanel;
