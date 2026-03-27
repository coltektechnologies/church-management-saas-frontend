'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getMember, updateMember, type MemberDetail } from '@/lib/api';
import { toast } from 'sonner';

export default function MemberEditPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) {
      return;
    }
    getMember(id)
      .then(setMember)
      .catch(() => setError('Failed to load member'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleSave = async () => {
    if (!member) {
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await updateMember(id, member);
      toast.success('Member updated', { description: 'Your changes were saved.' });
      router.push(`/admin/members/${id}`);
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Failed to update';
      setError(msg);
      toast.error('Could not save member', { description: msg });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading...</div>;
  }
  if (!member || error) {
    return (
      <div className="p-8">
        <Link href="/admin/members" className="text-sm text-gray-500 hover:underline">
          ← Back
        </Link>
        <p className="mt-4 text-red-600">{error || 'Member not found'}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <Link
          href={`/admin/members/${id}`}
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Member
        </Link>
        <Button onClick={handleSave} disabled={submitting}>
          {submitting ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
      <h1 className="text-2xl font-bold text-gray-900">Edit Member</h1>
      <p className="text-gray-500">
        Full edit form can be built here. For now, use the detail page Edit button.
      </p>
      <p className="text-sm text-amber-600">
        Edit form fields to be wired. Redirecting to detail page after save.
      </p>
    </div>
  );
}
