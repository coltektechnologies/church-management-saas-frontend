'use client';

import MemberAvatar from './MemberAvatar';
import { MemberContribution } from '@/types/memberFinance';

interface Props {
  member: MemberContribution;
  isSelected: boolean;
  onClick: () => void;
}

export default function MemberCard({ member, isSelected, onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl border transition-all text-left ${
        isSelected
          ? 'border-teal-400 bg-teal-50'
          : 'border-gray-200 bg-white hover:bg-gray-50 hover:border-gray-300'
      }`}
    >
      <MemberAvatar name={member.name} avatarUrl={member.avatarUrl} size={44} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{member.name}</p>
        <div className="flex items-center gap-3 mt-0.5 flex-wrap">
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <span className="text-gray-300 text-[10px]">⊞</span>
            {member.memberId}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1">
            <span className="text-gray-300 text-[10px]">☎</span>
            {member.phone}
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1 flex-shrink-0">
        <p className="text-sm font-bold text-teal-600">GHS{member.totalYTD.toLocaleString()}</p>
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
            member.status === 'Active' ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'
          }`}
        >
          {member.status}
        </span>
      </div>
    </button>
  );
}
