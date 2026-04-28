import { X } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#64748B]/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-[16px] font-bold text-[#0A2E46]">Change Password</h2>
          <button
            title="exit"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[#475569]">Current Password</label>
            <input
              title="current password"
              type="password"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2FC4B2]/20 focus:border-[#2FC4B2] text-[14px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[#475569]">New Password</label>
            <input
              title="new password"
              type="password"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2FC4B2]/20 focus:border-[#2FC4B2] text-[14px]"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-[13px] font-medium text-[#475569]">
              Confirm New Password
            </label>
            <input
              title="confirm password"
              type="password"
              className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2FC4B2]/20 focus:border-[#2FC4B2] text-[14px]"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 p-6 pt-0">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-[14px] font-bold text-[#475569] hover:bg-gray-50 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button className="px-6 py-2.5 text-[14px] font-bold text-white bg-[#2FC4B2] hover:bg-[#26A69A] rounded-lg transition-colors shadow-sm shadow-[#2FC4B2]/20">
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}
