'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CalendarDays,
  MapPin,
  Edit3,
  TrendingUp,
  Megaphone,
  Camera,
} from 'lucide-react';
import { toast } from 'sonner';
import type { MemberDetail } from '@/lib/api';
import { updateCurrentMemberProfile } from '@/lib/api';
import {
  displayMemberName,
  formatDateLong,
  formatEnumLabel,
  primarySecondaryDepartments,
  shortMemberRef,
} from '@/components/membership/memberProfileDisplay';

const MAX_PHOTO_BYTES = 1.5 * 1024 * 1024;

type Props = {
  member: MemberDetail | null;
  loading: boolean;
  onEdit?: () => void;
  onMemberUpdated?: (m: MemberDetail) => void;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {return '?';}
  if (parts.length === 1) {return parts[0].slice(0, 2).toUpperCase();}
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function ProfileSummaryCard({
  member,
  loading,
  onEdit,
  onMemberUpdated,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const pickPhoto = () => fileRef.current?.click();

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !member) {return;}
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file');
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      toast.error('Image is too large', { description: 'Use a photo under 1.5 MB.' });
      return;
    }
    setUploadingPhoto(true);
    try {
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => {
          if (typeof r.result === 'string') {resolve(r.result);}
          else {reject(new Error('Could not read file'));}
        };
        r.onerror = () => reject(new Error('Could not read file'));
        r.readAsDataURL(file);
      });
      const updated = await updateCurrentMemberProfile({ profile_photo: dataUrl });
      onMemberUpdated?.(updated);
      toast.success('Profile photo updated');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploadingPhoto(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-6 flex flex-col md:flex-row gap-6 animate-pulse">
        <div className="w-24 h-24 rounded-full bg-slate-200 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-8 w-48 bg-slate-200 rounded" />
          <div className="h-4 w-full max-w-md bg-slate-100 rounded" />
          <div className="flex gap-2 pt-2">
            <div className="h-9 w-28 bg-slate-200 rounded-md" />
            <div className="h-9 w-36 bg-slate-200 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  const name = displayMemberName(member);
  const photo = member?.profile_photo?.trim();
  const showPhoto = Boolean(photo && (photo.startsWith('http') || photo.startsWith('data:')));
  const { primary: primaryDept } = primarySecondaryDepartments(member?.department_names);

  return (
    <div className="bg-white border border-gray-100 rounded-xl p-6 shadow-sm mb-6 flex flex-col md:flex-row gap-6">
      <div className="flex relative flex-col items-start gap-3">
        <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-md relative bg-slate-100">
          {showPhoto && photo ? (
            // eslint-disable-next-line @next/next/no-img-element -- backend may return any image URL or data URL
            <img src={photo} alt="" className="absolute inset-0 w-full h-full object-cover" />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[20px] font-bold text-[#0A2E46]">
              {initials(name)}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 ">
          <input
            ref={fileRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={onFileChange}
          />
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#2FC4B2] text-[11px] font-medium text-[#0A2E46] hover:bg-[#E6F9F6] disabled:opacity-50 disabled:pointer-events-none"
            disabled={!member || uploadingPhoto}
            onClick={pickPhoto}
          >
            <Camera size={12} />
            {uploadingPhoto ? 'Uploading…' : 'Change photo'}
          </button>
        </div>
      </div>

      <div className="flex-1">
        <h2 className="text-[24px] font-bold text-[#0A2E46] mb-3">{member ? name : '—'}</h2>

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mb-4 text-[13px] text-gray-500 font-medium">
          <div className="flex items-center gap-2">
            <CreditCard size={16} className="text-[#2FC4B2]" />
            <span>{member ? shortMemberRef(member.id) : '—'}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarDays size={16} className="text-[#2FC4B2]" />
            <span>
              {member?.member_since
                ? `Member since ${formatDateLong(member.member_since)}`
                : '—'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-[#2FC4B2]" />
            <span>{primaryDept}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 bg-[#2FC4B2] text-white hover:bg-[#28b0a0] px-4 py-2 rounded-md text-[13px] font-semibold disabled:opacity-50 disabled:pointer-events-none"
            disabled={!member}
            onClick={() => onEdit?.()}
          >
            <Edit3 size={16} />
            Edit profile
          </button>
          <Link
            href="/membership/giving"
            className="inline-flex items-center gap-2 border border-[#2FC4B2] text-[#2FC4B2] hover:bg-[#E6F9F6] px-4 py-2 rounded-md text-[13px] font-semibold transition-colors"
          >
            <TrendingUp size={16} />
            View Giving History
          </Link>
          <Link
            href="/membership/announcements"
            className="inline-flex items-center gap-2 bg-[#BFF7EE] text-[#0A2E46] hover:bg-[#A8EBDD] px-4 py-2 rounded-md text-[13px] font-semibold transition-colors"
          >
            <Megaphone size={16} />
            Announcements
          </Link>
        </div>
      </div>
      <span className="inline-flex h-fit w-fit items-center text-center px-3 py-1 rounded-full bg-[#BFF7EE] text-[#0A2E46] text-[11px] font-bold">
        {member ? formatEnumLabel(member.membership_status) : '—'}
      </span>
    </div>
  );
}
