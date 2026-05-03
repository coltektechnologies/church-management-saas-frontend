import Link from 'next/link';
import { Contact, TrendingUp } from 'lucide-react';
import type { MemberDetail } from '@/lib/api';
import { displayMemberName } from '@/components/membership/memberProfileDisplay';

type Props = {
  member: MemberDetail | null;
  loading: boolean;
};

export default function MyContributionsTab({ member, loading }: Props) {
  if (loading) {
    return (
      <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-6 animate-pulse space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 bg-slate-100 rounded" />
          ))}
        </div>
        <div className="h-40 bg-slate-100 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-6">
      <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-4">
          <Contact size={20} className="text-[#0A2E46]" />
          <h3 className="text-[15px] font-bold text-[#0A2E46]">Contributions</h3>
        </div>
        <p className="text-[13px] text-gray-600 leading-relaxed">
          {member
            ? `Open Giving for tithes, offerings, recorded contributions, and pledges for ${displayMemberName(member)}. Treasury-linked payments update your totals automatically.`
            : 'Sign in with a linked member account to see your profile here.'}
        </p>
        <Link
          href="/membership/giving"
          className="mt-4 inline-flex items-center gap-2 bg-[#2FC4B2] hover:bg-[#26A69A] text-white px-5 py-2.5 rounded-md text-[13px] font-semibold transition-colors"
        >
          <TrendingUp size={16} />
          Go to Giving
        </Link>
      </div>
    </div>
  );
}