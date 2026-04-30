import { Phone, Mail, MapPin, Building, Map, Globe, Users } from 'lucide-react';

export default function ContactDetailsTab() {
  const fields = [
    { label: 'Phone Number', value: '+233 59 603 8258', icon: Phone, outlined: true },
    { label: 'Email', value: 'owusuwills@gmail.com', icon: Mail, outlined: true },
    {
      label: 'Residential Address',
      value: '123 Main Street, Sunyani, Ghana',
      icon: MapPin,
      outlined: false,
    },
    { label: 'City', value: 'Sunyani', icon: Building, outlined: false },
    { label: 'Region / State', value: 'Bono', icon: Map, outlined: true },
    { label: 'Country', value: 'Ghana', icon: Globe, outlined: false },
  ];

  return (
    <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-6 mb-8">
        {fields.map((field, idx) => {
          const Icon = field.icon;
          return (
            <div key={idx} className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Icon size={16} className="text-[#2FC4B2]" />
                <span className="text-[13px] font-bold text-[#0A2E46]">{field.label}</span>
              </div>
              <div
                className={`flex items-center px-4 py-2.5 text-[13px] text-[#0A2E46] font-medium min-h-10 rounded-md ${
                  field.outlined
                    ? 'border border-[#2FC4B2] bg-[#F4FDFB]'
                    : 'bg-[#F1F5F9] border border-transparent'
                }`}
              >
                {field.value}
              </div>
            </div>
          );
        })}
      </div>

      {/* Emergency Contact */}
      <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-200">
          <Users size={20} className="text-[#0A2E46]" />
          <h3 className="text-[15px] font-bold text-[#0A2E46]">Emergency Contact</h3>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-[13px] text-gray-500 font-medium">Name:</span>
            <span className="text-[13px] text-[#0A2E46] font-medium">Owusu Simon</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-[13px] text-gray-500 font-medium">Relationship:</span>
            <span className="text-[13px] text-[#0A2E46] font-medium">Brother</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="text-[13px] text-gray-500 font-medium">Phone:</span>
            <span className="text-[13px] text-[#0A2E46] font-medium">+233 24 794 1259</span>
          </div>
        </div>
      </div>
    </div>
  );
}
