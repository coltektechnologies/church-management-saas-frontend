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
import { toast } from 'sonner';
import { DeleteMemberDialog } from '@/components/admin/membership/DeleteMemberDialog';
import { useMembersPortal } from '@/components/admin/membership/MembersPortalContext';
import {
  resolveEmergencyContact,
  stripEmergencyContactBlockFromNotes,
} from '@/lib/memberNotesDisplay';

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
  const { memberProfilePresentation = 'default' } = useMembersPortal();
  const dept = memberProfilePresentation === 'department';
  const v = value?.toString().trim();
  if (!v) {
    return null;
  }
  if (dept) {
    return (
      <div className="flex items-start gap-3 py-2.5 border-b border-stone-100 last:border-0">
        {Icon && <Icon className="h-4 w-4 text-emerald-900/45 shrink-0 mt-0.5" />}
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-stone-500 uppercase tracking-wide">{label}</p>
          <p className="text-sm text-stone-800 mt-0.5 leading-relaxed">{v}</p>
        </div>
      </div>
    );
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
  const { memberProfilePresentation = 'default' } = useMembersPortal();
  if (memberProfilePresentation === 'department') {
    return (
      <div className="rounded-2xl border border-stone-200/90 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-stone-100 bg-gradient-to-r from-emerald-50/50 via-white to-stone-50/70 flex items-center gap-2.5">
          {Icon && <Icon className="h-4 w-4 text-emerald-900/50 shrink-0" />}
          <h3 className="font-semibold text-stone-800 text-sm tracking-tight">{title}</h3>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    );
  }
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
  const {
    membersBasePath,
    memberProfilePresentation = 'default',
    hideRemoveFromChurchDirectory,
  } = useMembersPortal();
  const isDept = memberProfilePresentation === 'department';
  const params = useParams();
  const id = params.id as string;
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    getMember(id)
      .then(setMember)
      .catch(() => setError('Failed to load member'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDeleteConfirm = async () => {
    if (!id) {
      return;
    }
    setDeleting(true);
    try {
      await deleteMember(id);
      toast.success('Member removed', { description: 'Returning to the members list.' });
      setDeleteDialogOpen(false);
      router.push(membersBasePath);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to delete member';
      setError(msg);
      toast.error('Could not delete member', { description: msg });
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
          href={membersBasePath}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Members
        </Link>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-700">{error || 'Member not found'}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push(membersBasePath)}>
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

  const ec = resolveEmergencyContact(member);
  const displayNotesRaw = stripEmergencyContactBlockFromNotes(member.notes || '');
  const displayNotes = displayNotesRaw.trim();
  const showNotes = displayNotes.length > 0;

  const backClass = isDept
    ? 'inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-800 mb-2'
    : 'inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-2';
  const titleClass = isDept
    ? 'text-2xl font-semibold text-stone-900 tracking-tight'
    : 'text-2xl font-bold text-gray-900';

  return (
    <div className={`space-y-6 pb-12 ${isDept ? 'max-w-5xl' : ''}`}>
      {/* Header */}
      <div className="flex flex-row items-start justify-between gap-4">
        <div>
          <Link href={membersBasePath} className={backClass}>
            <ArrowLeft className="h-4 w-4" />
            {isDept ? 'Back to department members' : 'Back to Members'}
          </Link>
          <h1 className={titleClass} style={{ fontFamily: 'OV Soge, sans-serif' }}>
            {isDept ? 'Member profile' : 'Member Details'}
          </h1>
          {isDept ? (
            <p className="text-sm text-stone-500 mt-1.5 max-w-xl leading-relaxed">
              Fellowship and contact details for pastoral care within your department. Sensitive
              directory actions remain with church administration.
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Link href={`${membersBasePath}/${id}/edit`}>
            <Button variant="outline" size="sm" className="gap-2">
              {isDept ? 'Edit details' : 'Edit Member'}
            </Button>
          </Link>
          {!hideRemoveFromChurchDirectory ? (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-red-600 border-red-200 hover:bg-red-50"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={deleting}
            >
              Delete Member
            </Button>
          ) : null}
        </div>
      </div>

      {/* Profile Card */}
      <div
        className={
          isDept
            ? 'rounded-2xl border border-stone-200/90 bg-gradient-to-br from-white via-white to-emerald-50/30 p-6 sm:p-7 flex flex-col sm:flex-row items-start gap-6 shadow-sm'
            : 'bg-white rounded-xl border border-gray-200 p-6 flex flex-col sm:flex-row items-start gap-6'
        }
      >
        <Avatar
          className={`h-24 w-24 shrink-0 ${isDept ? 'ring-2 ring-emerald-900/10 ring-offset-2' : 'bg-green-100'}`}
        >
          <AvatarFallback
            className={
              isDept
                ? 'bg-emerald-100 text-emerald-900 text-2xl font-medium'
                : 'bg-green-100 text-green-700 text-2xl'
            }
          >
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className={`text-xl font-semibold ${isDept ? 'text-stone-900' : 'text-gray-900'}`}>
              {fullName}
            </h2>
            <span
              className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${
                STATUS_STYLE[member.membership_status || ''] || 'border-gray-300 text-gray-600'
              }`}
            >
              {member.membership_status?.replace(/_/g, ' ') || 'Unknown'}
            </span>
          </div>
          {member.occupation && (
            <p className={`mt-1 ${isDept ? 'text-stone-600' : 'text-gray-600'}`}>
              {member.occupation}
            </p>
          )}
          <p className={`text-sm mt-2 ${isDept ? 'text-stone-500' : 'text-gray-500'}`}>
            Member since{' '}
            {member.member_since ? new Date(member.member_since).toLocaleDateString() : '—'}
          </p>
        </div>
      </div>

      {/* Content Grid */}
      <div className={`grid grid-cols-1 lg:grid-cols-2 ${isDept ? 'gap-5 lg:gap-6' : 'gap-6'}`}>
        <Section title={isDept ? 'Personal' : 'Personal Information'} icon={User}>
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

        <Section title={isDept ? 'Contact & residence' : 'Contact Information'} icon={Phone}>
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

        <Section title={isDept ? 'Church & membership' : 'Church Information'} icon={Church}>
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

        {isDept ? (
          <Section title="Work & occupation" icon={Briefcase}>
            <DetailRow label="Occupation" value={member.occupation} icon={Briefcase} />
            <DetailRow label="Employer" value={member.employer} />
          </Section>
        ) : (
          <Section title="Professional & Emergency" icon={Briefcase}>
            <DetailRow label="Occupation" value={member.occupation} icon={Briefcase} />
            <DetailRow label="Employer" value={member.employer} />
            <DetailRow label="Emergency Contact" value={ec.name} icon={Shield} />
            <DetailRow label="Relationship" value={ec.relationship} />
            <DetailRow label="Emergency Phone" value={ec.phone} icon={Phone} />
          </Section>
        )}
      </div>

      {isDept ? (
        <Section title="In case of emergency" icon={Shield}>
          <DetailRow label="Contact name" value={ec.name} icon={Shield} />
          <DetailRow label="Relationship" value={ec.relationship} />
          <DetailRow label="Phone" value={ec.phone} icon={Phone} />
        </Section>
      ) : null}

      {showNotes ? (
        <Section title="Notes" icon={User}>
          <p
            className={
              isDept
                ? 'text-sm text-stone-700 whitespace-pre-wrap leading-relaxed'
                : 'text-sm text-gray-700 whitespace-pre-wrap'
            }
          >
            {displayNotes}
          </p>
        </Section>
      ) : null}

      <DeleteMemberDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        names={[fullName]}
        loading={deleting}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
