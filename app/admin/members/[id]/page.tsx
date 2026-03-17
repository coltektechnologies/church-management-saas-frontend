'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Briefcase,
  Church,
  Shield,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getMember, deleteMember, type MemberDetail } from '@/lib/api';

const STATUS_STYLE: Record<string, string> = {
  ACTIVE: 'border-green-500 text-green-600 bg-white',
  INACTIVE: 'border-gray-400 text-gray-600 bg-gray-50',
  PENDING: 'border-amber-500 text-amber-600 bg-white',
  TRANSFER: 'border-blue-500 text-blue-600 bg-white',
  NEW_CONVERT: 'border-teal-500 text-teal-600 bg-white',
  VISITOR: 'border-purple-500 text-purple-600 bg-white',
};

function DetailRow({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string | undefined | null;
  icon?: React.ComponentType<{ className?: string }>;
}) {
  const v = value?.toString().trim();
  if (!v) {
    return null;
  }
  return (
    <div className="flex items-start gap-3 py-2 border-b border-gray-100 last:border-0">
      {Icon && <Icon className="h-5 w-5 text-gray-400 shrink-0 mt-0.5" />}
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-900 mt-0.5">{v}</p>
      </div>
    </div>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-gray-600" />}
        <h3 className="font-semibold text-gray-900">{title}</h3>
      </div>
      <div className="px-6 py-4">{children}</div>
    </div>
  );
}

export default function MemberDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    getMember(id)
      .then(setMember)
      .catch(() => setError('Failed to load member'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (
      !id ||
      !confirm('Are you sure you want to delete this member? This action cannot be undone.')
    ) {
      return;
    }
    setDeleting(true);
    try {
      await deleteMember(id);
      router.push('/admin/members');
    } catch {
      setError('Failed to delete member');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-gray-500">Loading member...</p>
      </div>
    );
  }

  if (!member || error) {
    return (
      <div className="space-y-4">
        <Link
          href="/admin/members"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Members
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error || 'Member not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push('/admin/members')}>
            Return to Members
          </Button>
        </div>
      </div>
    );
  }

  const fullName =
    member.full_name ||
    [member.first_name, member.middle_name, member.last_name].filter(Boolean).join(' ');
  const initials = fullName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const location = member.location as
    | { phone_primary?: string; email?: string; address?: string; city?: string; region?: string }
    | undefined;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-row items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/members"
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Members
          </Link>
          <h1
            className="text-2xl font-bold text-gray-900"
            style={{ fontFamily: 'OV Soge, sans-serif' }}
          >
            Member Details
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/admin/members/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              Edit Member
            </Button>
          </Link>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Member'}
          </Button>
        </div>
      </div>

      {/* Profile Card */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col sm:flex-row items-start gap-6">
        <Avatar className="h-24 w-24 bg-green-100 shrink-0">
          <AvatarFallback className="bg-green-100 text-green-700 text-2xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-gray-900">{fullName}</h2>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                STATUS_STYLE[member.membership_status || ''] || 'border-gray-300 text-gray-600'
              }`}
            >
              {member.membership_status?.replace(/_/g, ' ') || 'Unknown'}
            </span>
          </div>
          {member.occupation && <p className="text-gray-600 mt-1">{member.occupation}</p>}
          <p className="text-sm text-gray-500 mt-2">
            Member since{' '}
            {member.member_since ? new Date(member.member_since).toLocaleDateString() : '—'}
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Section title="Personal Information" icon={User}>
          <DetailRow label="Title" value={member.title} icon={User} />
          <DetailRow label="Gender" value={member.gender} />
          <DetailRow
            label="Date of Birth"
            value={
              member.date_of_birth ? new Date(member.date_of_birth).toLocaleDateString() : null
            }
            icon={Calendar}
          />
          <DetailRow label="Marital Status" value={member.marital_status?.replace(/_/g, ' ')} />
          <DetailRow label="National ID" value={member.national_id} />
        </Section>

        <Section title="Contact Information" icon={Phone}>
          <DetailRow
            label="Phone"
            value={location?.phone_primary || (member as { phone_primary?: string }).phone_primary}
            icon={Phone}
          />
          <DetailRow
            label="Email"
            value={location?.email || (member as { email?: string }).email}
            icon={Mail}
          />
          <DetailRow label="Address" value={location?.address} icon={MapPin} />
          <DetailRow
            label="City / Region"
            value={[location?.city, location?.region].filter(Boolean).join(', ') || null}
          />
        </Section>

        <Section title="Church Information" icon={Church}>
          <DetailRow
            label="Member Since"
            value={member.member_since ? new Date(member.member_since).toLocaleDateString() : null}
            icon={Calendar}
          />
          <DetailRow
            label="Membership Status"
            value={member.membership_status?.replace(/_/g, ' ')}
          />
          <DetailRow label="Baptism Status" value={member.baptism_status?.replace(/_/g, ' ')} />
          <DetailRow label="Education Level" value={member.education_level?.replace(/_/g, ' ')} />
        </Section>

        <Section title="Professional & Emergency" icon={Briefcase}>
          <DetailRow label="Occupation" value={member.occupation} icon={Briefcase} />
          <DetailRow label="Employer" value={member.employer} />
          <DetailRow
            label="Emergency Contact"
            value={member.emergency_contact_name}
            icon={Shield}
          />
          <DetailRow label="Relationship" value={member.emergency_contact_relationship} />
          <DetailRow label="Emergency Phone" value={member.emergency_contact_phone} icon={Phone} />
        </Section>
      </div>

      {member.notes && (
        <Section title="Notes" icon={User}>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">{member.notes}</p>
        </Section>
      )}
    </div>
  );
}
