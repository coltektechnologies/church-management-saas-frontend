import { User, Contact, Building2, HeartHandshake, Settings } from 'lucide-react';

interface ProfileTabsProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function ProfileTabs({ activeTab, setActiveTab }: ProfileTabsProps) {
  const tabs = [
    { id: 'personal', label: 'Personal Info', icon: User },
    { id: 'contact', label: 'Contact Details', icon: Contact },
    { id: 'church', label: 'Church Info', icon: Building2 },
    { id: 'contributions', label: 'My Contributions', icon: HeartHandshake },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="bg-gray-100 rounded-t-xl border border-gray-200 border-b-0 overflow-x-auto">
      <div className="flex min-w-max px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 px-4 py-3 relative"
            >
              <Icon size={16} className={isActive ? 'text-[#2FC4B2]' : 'text-[#0A2E46]'} />
              <span
                className={`text-[13px] font-bold ${
                  isActive ? 'text-[#2FC4B2]' : 'text-[#0A2E46]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2FC4B2]" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
