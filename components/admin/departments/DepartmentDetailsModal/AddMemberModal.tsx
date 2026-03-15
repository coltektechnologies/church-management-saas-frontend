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
  onAdd: () => void;
  error?: string;
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
}: Props) {
  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl space-y-6">
        <h3 className="text-xl font-semibold">Add Member</h3>

        <div>
          <label className="block text-sm font-medium mb-2">Select Church Member</label>

          <select
            value={selectedMemberId}
            onChange={(e) => setSelectedMemberId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
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
          <label className="block text-sm font-medium mb-2">Assign Role</label>

          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2"
          >
            <option>Member</option>
            <option>Leader</option>
            <option>Assistant</option>
          </select>
        </div>

        {/* Error message*/}
        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>

          <button
            onClick={onAdd}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
