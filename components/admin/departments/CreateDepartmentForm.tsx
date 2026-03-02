import { RefObject } from 'react';

interface Props {
  showCreate: boolean;
  setShowCreate: (value: boolean) => void;
  formData: any;
  setFormData: any;
  handleChange: any;
  handleIconUpload: any;
  handleCreateDepartment: () => void;
  formRef: RefObject<HTMLDivElement>;
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

      {/* EVERYTHING ELSE STAYS EXACTLY AS YOU HAD IT */}

      {/* BASIC INFORMATION */}
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-gray-800 uppercase tracking-wide">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department Name */}
          <div className="flex flex-col space-y-2">
            <label className="text-sm font-medium text-gray-700">Department Name</label>
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
            <label className="text-sm font-medium text-gray-700">Department Code</label>
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
              Department Color Theme
            </label>
          </div>

          <div className="flex flex-wrap gap-4">
            {[
              'bg-blue-600',
              'bg-green-600',
              'bg-red-600',
              'bg-purple-600',
              'bg-yellow-500',
              'bg-pink-600',
              'bg-indigo-600',
            ].map((color, index) => (
              <div
                key={index}
                onClick={() => setFormData((prev) => ({ ...prev, themeColor: color }))}
                className={`w-11 h-11 rounded-full cursor-pointer ${color}
        ${
          formData.themeColor === color
            ? 'ring-2 ring-black scale-110'
            : 'border-2 border-transparent'
        } transition`}
              />
            ))}
          </div>
        </div>

        {/* Icon Picker */}
        <div className="p-5 rounded-xl bg-gray-50 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <label className="text-base font-medium text-gray-800">Department Icon</label>

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
            {['🏛️', '🎵', '🙏', '📖', '💰', '🎤', '🤝', '🧒', '🎨', '🕊️'].map((icon, index) => (
              <div
                key={index}
                onClick={() => setFormData((prev) => ({ ...prev, icon }))}
                className={`flex items-center justify-center h-14 w-14 rounded-xl cursor-pointer text-2xl
          ${
            formData.icon === icon
              ? 'bg-gray-200 border border-black scale-105'
              : 'border border-gray-300 hover:bg-gray-100'
          } transition`}
              >
                {icon}
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
          className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium"
        >
          + Create Department
        </button>
      </div>
    </div>
  );
}
