import Image from 'next/image';
import {
  CreditCard,
  CalendarDays,
  MapPin,
  Edit3,
  TrendingUp,
  Megaphone,
  Camera,
} from 'lucide-react';

export default function ProfileSummaryCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-6 flex flex-col md:flex-row gap-6">
      {/* Avatar Section */}
      <div className="flex relative flex-col items-start gap-3">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md relative">
          <Image
            src="https://images.unsplash.com/photo-1506277886164-e25aa3f4ef7f?q=80&w=256&auto=format&fit=crop"
            alt="Profile Avatar"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="flex flex-col gap-2 ">
          <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-200 text-[11px] font-medium text-gray-600 hover:bg-gray-50 transition-colors">
            <Camera size={12} />
            change photo
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="flex-1">
        <h2 className="text-[24px] font-bold text-[#0A2E46] mb-3">Owusu William</h2>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-[13px] text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-[#2FC4B2]" />
            <span>M-024</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-[#2FC4B2]" />
            <span>Member since January 15, 2023</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#2FC4B2]" />
            <span>Music Ministry</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button className="flex items-center gap-2 bg-[#2FC4B2] hover:bg-[#26A69A] text-white px-4 py-2 rounded-md text-[13px] font-semibold transition-colors">
            <Edit3 size={16} />
            Edit Profile
          </button>
          <button className="flex items-center gap-2 border border-[#2FC4B2] text-[#2FC4B2] hover:bg-[#E6F9F6] px-4 py-2 rounded-md text-[13px] font-semibold transition-colors">
            <TrendingUp size={16} />
            View Giving History
          </button>
          <button className="flex items-center gap-2 bg-[#BFF7EE] text-[#0A2E46] hover:bg-[#A8EBDD] px-4 py-2 rounded-md text-[13px] font-semibold transition-colors">
            <Megaphone size={16} />
            Announcements
          </button>
        </div>
      </div>
      {/* Status Badge */}
      <span className="inline-flex h-fit w-fit items-center text-center px-3 py-1 rounded-full bg-[#BFF7EE] text-[#0A2E46] text-[11px] font-bold">
        Active
      </span>
    </div>
  );
}
