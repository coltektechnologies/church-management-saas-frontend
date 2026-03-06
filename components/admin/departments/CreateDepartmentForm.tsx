import { RefObject, Dispatch, SetStateAction } from 'react';
import { DEPARTMENT_COLORS, DEPARTMENT_ICONS } from '@/constants/departments';
import type { ThemeColor } from '@/constants/departments';

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
}: Props) {
  if (!showCreate) {
    return null;
  }

  return (
    <div
      ref={formRef}
      className="bg-white max-w-5xl mx-auto p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8"
    >
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-800">Create New Department</h2>
        <button onClick={() => setShowCreate(false)} className="text-gray-500 hover:text-gray-700">
          ✕
        </button>
      </div>

      {/* BASIC INFORMATION */}
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-gray-800 uppercase tracking-wide">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department Name */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Department Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Department Code */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Department Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="code"
              value={formData.code}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Department Head */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Department Head</label>
            <select className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none">
              <option>Select Department Head</option>
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* VISUAL IDENTITY */}
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-gray-800 uppercase tracking-wide">
          Visual Identity
        </h3>

        {/* Color Theme */}
        <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
          <div className="mb-4">
            <label className="text-base font-medium text-gray-800 block">
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
                  <div className="absolute inset-0 rounded-full ring-4 ring-pink-400 ring-offset-2 ring-offset-white" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <label className="text-base font-medium text-gray-800">
              Department Icon <span className="text-red-500">*</span>
            </label>

            {/* Upload Button */}
            <label className="text-sm text-blue-600 cursor-pointer hover:underline">
              Upload Icon
              <input type="file" accept="image/*" onChange={handleIconUpload} className="hidden" />
            </label>
          </div>

          {formData.icon?.startsWith('data:') && (
            <div className="mb-6 p-4 rounded-xl border border-blue-200 bg-blue-50 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-xl overflow-hidden border border-blue-400">
                  <img
                    src={formData.icon}
                    alt="Custom Icon"
                    className="h-full w-full object-cover"
                  />
                </div>

                <div>
                  <p className="text-sm font-semibold text-blue-700">Custom Icon Selected</p>
                  <p className="text-xs text-blue-600">
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
                className="text-xs text-red-600 hover:text-red-700 hover:opacity-80 cursor-pointer transition"
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
                className={`
  h-14 w-14 flex items-center justify-center rounded-xl text-xl cursor-pointer relative transition
  bg-gray-100 text-gray-800 hover:bg-gray-200
`}
              >
                {formData.icon === item.name && (
                  <div className="absolute inset-0 rounded-xl ring-4 ring-pink-400 ring-offset-2 ring-offset-white" />
                )}
                <span className="relative z-10">{item.icon}</span>
                {formData.icon === item.name && (
                  <div className="absolute inset-0 rounded-xl ring-4 ring-pink-400 ring-offset-2 ring-offset-white" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-gray-800 uppercase tracking-wide">
          Description
        </h3>

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>
      {formError && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
          {formError}
        </div>
      )}
      {/* Buttons */}
      <div className="flex justify-end space-x-4">
        <button
          onClick={() => setShowCreate(false)}
          className="px-6 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700"
        >
          Cancel
        </button>

        <button
          onClick={handleCreateDepartment}
          disabled={
            !formData.name.trim() || !formData.code.trim() || !formData.themeColor || !formData.icon
          }
          className={`px-6 py-2 rounded-lg font-medium transition ${
            !formData.name.trim() || !formData.code.trim() || !formData.themeColor || !formData.icon
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {editingDepartment ? 'Update Department' : '+ Create Department'}
        </button>
      </div>
    </div>
  );
}
