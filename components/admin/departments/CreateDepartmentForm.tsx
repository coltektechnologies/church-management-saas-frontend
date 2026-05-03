import { RefObject, Dispatch, SetStateAction } from 'react';
import Image from 'next/image';
import { DEPARTMENT_COLORS, DEPARTMENT_ICONS } from '@/constants/departments';
import type { ThemeColor } from '@/constants/departments';

const fieldClassName =
  'border border-[var(--admin-border)] bg-[var(--admin-surface)] text-foreground rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500/70 outline-none dark:[color-scheme:dark]';
const panelMuted =
  'p-5 rounded-xl bg-muted/40 dark:bg-white/[0.04] border border-[var(--admin-border)]';
const ringOffsetSurface = 'ring-offset-[var(--admin-surface)] dark:ring-offset-[var(--admin-surface)]';

interface FormData {
  name: string;
  code: string;
  description: string;
  status: 'active' | 'inactive';
  themeColor: ThemeColor;
  icon: string;
}

interface Props {
  showCreate: boolean;
  setShowCreate: (value: boolean) => void;
  formData: FormData;
  formError: string | null;
  setFormData: Dispatch<SetStateAction<FormData>>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => void;
  handleIconUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCreateDepartment: () => void;
  formRef: RefObject<HTMLDivElement | null>;
  editingDepartment?: boolean;
  saving?: boolean;
}

export default function CreateDepartmentForm({
  showCreate,
  setShowCreate,
  formData,
  setFormData,
  handleChange,
  handleIconUpload,
  handleCreateDepartment,
  formRef,
  formError,
  editingDepartment,
  saving = false,
}: Props) {
  if (!showCreate) {
    return null;
  }

  return (
    <div
      ref={formRef}
      className="bg-[var(--admin-surface)] max-w-5xl mx-auto p-8 rounded-2xl border border-[var(--admin-border)] shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">
          {editingDepartment ? 'Edit Department' : 'Create New Department'}
        </h2>
        <button
          type="button"
          onClick={() => setShowCreate(false)}
          className="text-muted-foreground hover:text-foreground rounded-lg p-1"
        >
          ✕
        </button>
      </div>

      {/* BASIC INFORMATION */}
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department Name */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-foreground">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={fieldClassName}
            />
          </div>

          {/* Department Code */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-foreground">
              Department Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className={fieldClassName}
            />
          </div>

          <p className="text-sm text-muted-foreground md:col-span-2 -mt-2">
            Assign department head and elder in charge from the department detail window → Settings
            after you create or open the department.
          </p>

          {/* Status */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={fieldClassName}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* VISUAL IDENTITY */}
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
          Visual Identity
        </h3>

        {/* Color Theme */}
        <div className={panelMuted}>
          <div className="mb-4">
            <label className="text-base font-medium text-foreground block">
              Department Color Theme <span className="text-red-500">*</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            {DEPARTMENT_COLORS.map((color) => (
              <div
                key={color.name}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    themeColor: color.name,
                  }))
                }
                className={`
      w-12 h-12 rounded-full cursor-pointer relative transition
      ${color.class}
    `}
              >
                {formData.themeColor === color.name && (
                  <div
                    className={`absolute inset-0 rounded-full ring-4 ring-pink-400 ring-offset-2 ${ringOffsetSurface}`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div className={panelMuted}>
          <div className="flex items-center justify-between mb-4">
            <label className="text-base font-medium text-foreground">
              Department Icon <span className="text-red-500">*</span>
            </label>

            {/* Upload Button */}
            <label className="text-sm text-blue-600 dark:text-blue-400 cursor-pointer hover:underline">
              Upload Icon
              <input type="file" accept="image/*" onChange={handleIconUpload} className="hidden" />
            </label>
          </div>

          {formData.icon?.startsWith('data:') && (
            <div className="mb-6 p-4 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/40 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl overflow-hidden border border-blue-400 dark:border-blue-600 relative">
                  <Image
                    src={formData.icon}
                    alt="Custom Icon"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">
                    Custom Icon Selected
                  </p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    This icon will be used for the department.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    icon: '',
                  }))
                }
                className="text-xs text-red-600 dark:text-red-400 hover:opacity-80 cursor-pointer transition"
              >
                Remove
              </button>
            </div>
          )}

          <div
            className={`grid grid-cols-5 md:grid-cols-8 gap-4 transition ${
              formData.icon?.startsWith('data:') ? 'opacity-50 pointer-events-none' : 'opacity-100'
            }`}
          >
            {DEPARTMENT_ICONS.map((item) => (
              <div
                key={item.name}
                onClick={() =>
                  setFormData((prev) => ({
                    ...prev,
                    icon: item.name,
                  }))
                }
                className="h-14 w-14 flex items-center justify-center rounded-xl text-xl cursor-pointer relative transition bg-muted text-foreground hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/15"
              >
                {formData.icon === item.name && (
                  <div
                    className={`absolute inset-0 rounded-xl ring-4 ring-pink-400 ring-offset-2 ${ringOffsetSurface}`}
                  />
                )}
                <span className="relative z-10">{item.icon}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground uppercase tracking-wide">
          Description
        </h3>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className={`w-full ${fieldClassName}`}
        />
      </div>
      {formError && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-sm">
          {formError}
        </div>
      )}
      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          type="button"
          onClick={() => setShowCreate(false)}
          className="px-6 py-2 rounded-lg bg-muted hover:bg-muted/80 text-foreground"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={handleCreateDepartment}
          disabled={
            saving ||
            !formData.name.trim() ||
            !formData.code.trim() ||
            !formData.themeColor ||
            !formData.icon
          }
          className={`px-6 py-2 rounded-lg font-medium transition ${
            saving ||
            !formData.name.trim() ||
            !formData.code.trim() ||
            !formData.themeColor ||
            !formData.icon
              ? 'bg-muted text-muted-foreground cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400 text-white'
          }`}
        >
          {saving ? 'Saving…' : editingDepartment ? 'Update Department' : '+ Create Department'}
        </button>
      </div>
    </div>
  );
}
