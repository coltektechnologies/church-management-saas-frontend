'use client';

type MockChurchMember = {
  id: string;
  name: string;
  email: string;
};

interface Props {
  show: boolean;
  onClose: () => void;
  mockChurchMembers: MockChurchMember[];
  selectedMemberId: string;
  setSelectedMemberId: (id: string) => void;
  selectedRole: string;
  setSelectedRole: (role: string) => void;
  onAdd: () => void | Promise<void>;
  error?: string;
  assigning?: boolean;
}

export default function AddMemberModal({
  show,
  onClose,
  mockChurchMembers,
  selectedMemberId,
  setSelectedMemberId,
  selectedRole,
  setSelectedRole,
  onAdd,
  error,
  assigning = false,
}: Props) {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-[var(--admin-surface)] text-foreground w-full max-w-md rounded-2xl p-8 shadow-2xl border border-[var(--admin-border)] space-y-6">
        <h3 className="text-xl font-semibold">Add Member</h3>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Select Church Member</label>

          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full border border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-lg px-4 py-2 dark:[color-scheme:dark]"
          >
            <option value="">Select a member</option>
            {mockChurchMembers.map((member) => (
              <option key={member.id} value={member.id}>
                {member.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-foreground">Assign Role</label>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full border border-[var(--admin-border)] bg-[var(--admin-surface)] rounded-lg px-4 py-2 dark:[color-scheme:dark]"
          >
            <option>Member</option>
            <option>Leader</option>
            <option>Assistant</option>
          </select>
        </div>

        {/* Error message*/}
        {error && (
          <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[var(--admin-border)] hover:bg-muted/50"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={assigning}
            onClick={() => void onAdd()}
            className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-400 disabled:opacity-60"
          >
            {assigning ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
}
