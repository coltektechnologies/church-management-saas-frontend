'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Department {
  id: string;
  name: string;
  code: string;
  description: string;
  members: number;
  activities: number;
  budgetUsed: number;
  status: 'active' | 'inactive';
  themeColor: string;
  icon: string;
}

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Secretariat',
    code: 'SEC-001',
    description: 'Records, communication, documentation management',
    members: 5,
    activities: 12,
    budgetUsed: 48,
    status: 'active',
    themeColor: 'bg-blue-600',
    icon: '📖',
  },
  {
    id: '2',
    name: 'Treasury',
    code: 'TRD-002',
    description: 'Financial oversight and budget control',
    members: 4,
    activities: 8,
    budgetUsed: 35,
    status: 'active',
    themeColor: 'bg-green-600',
    icon: '💰',
  },
  {
    id: '3',
    name: 'Deaconry',
    code: 'DCN-003',
    description: 'Community welfare and support',
    members: 6,
    activities: 10,
    budgetUsed: 60,
    status: 'inactive',
    themeColor: 'bg-purple-600',
    icon: '🤝',
  },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [showCreate, setShowCreate] = useState(false);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showCreate && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showCreate]);

  const totalDepartments = departments.length;
  const activeDepartments = departments.filter((d) => d.status === 'active').length;
  const inactiveDepartments = departments.filter((d) => d.status === 'inactive').length;
  const totalMembers = departments.reduce((sum, d) => sum + d.members, 0);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    themeColor: 'bg-blue-600',
    icon: '🏛️',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const handleCreateDepartment = () => {
    if (!formData.name || !formData.code) {
      alert('Name and Code are required');
      return;
    }

    const newDepartment: Department = {
      id: Date.now().toString(),
      name: formData.name,
      code: formData.code,
      description: formData.description,
      members: 0,
      activities: 0,
      budgetUsed: 0,
      status: formData.status,
      themeColor: formData.themeColor,
      icon: formData.icon,
    };

    setDepartments((prev) => [...prev, newDepartment]);

    setFormData({
      name: '',
      code: '',
      description: '',
      status: 'active',
      themeColor: 'bg-blue-600',
      icon: '🏛️',
    });

    setShowCreate(false);
  };

  return (
    <div className="space-y-10">
      {/* HEADER */}
      <div className="space-y-6">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600 transition">
          ← Back to Dashboard
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
              Church Departments
            </h1>

            <p className="mt-3 text-lg text-gray-600 max-w-2xl leading-relaxed">
              Manage and coordinate all ministry departments in your church.
            </p>
          </div>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-blue-700 shadow-sm hover:shadow-lg transition-all duration-200"
          >
            + Create Department
          </button>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <SummaryCard title="Total Departments" value={totalDepartments} color="text-blue-600" />
        <SummaryCard title="Active Departments" value={activeDepartments} color="text-green-600" />
        <SummaryCard
          title="Inactive Departments"
          value={inactiveDepartments}
          color="text-red-600"
        />
        <SummaryCard title="Department Heads" value={12} color="text-purple-600" />
        <SummaryCard title="Total Members" value={totalMembers} color="text-orange-600" />
      </div>

      {/* GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {departments.map((dept) => (
          <DepartmentCard key={dept.id} department={dept} />
        ))}
      </div>

      {/* CREATE FORM */}
      {showCreate && (
        <div
          ref={formRef}
          className="bg-white max-w-5xl mx-auto p-8 rounded-2xl border border-gray-200 shadow-sm space-y-8"
        >
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Create New Department</h2>
            <button
              onClick={() => setShowCreate(false)}
              className="text-gray-500 hover:text-gray-700"
            >
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
            <div className="space-y-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <label className="text-base font-medium text-gray-800">Department Color Theme</label>

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
            <div className="space-y-4 p-4 rounded-xl bg-gray-50 border border-gray-200">
              <label className="text-base font-medium text-gray-800">Department Icon</label>

              <div className="grid grid-cols-5 md:grid-cols-8 gap-4">
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
      )}
    </div>
  );
}

function SummaryCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg/30 transition">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`mt-3 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}

function DepartmentCard({ department }: { department: Department }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden min-h-[360px] flex flex-col">
      {/* HEADER */}
      <div className={`${department.themeColor} px-6 py-6 text-white`}>
        <div className="flex items-center justify-between">
          {/* LEFT SIDE */}
          <div>
            <h3 className="text-xl font-semibold leading-tight">{department.name}</h3>
            <p className="text-sm opacity-90 mt-1">{department.code}</p>
          </div>

          {/* RIGHT SIDE ICON */}
          <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center text-2xl">
            {department.icon}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 px-6 py-6 flex flex-col justify-between space-y-6">
        {/* Stats */}
        <div className="flex justify-between text-gray-800">
          <div>
            <p className="font-semibold text-lg">{department.members}</p>
            <p className="text-sm text-gray-500">Members</p>
          </div>

          <div>
            <p className="font-semibold text-lg">{department.activities}</p>
            <p className="text-sm text-gray-500">Activities</p>
          </div>

          <div>
            <p className="font-semibold text-lg">{department.budgetUsed}%</p>
            <p className="text-sm text-gray-500">Budget Used</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 h-2.5 rounded-full">
          <div
            className="bg-black/30 h-2.5 rounded-full"
            style={{ width: `${department.budgetUsed}%` }}
          />
        </div>

        {/* Description */}
        <p className="text-base text-gray-600 leading-relaxed">{department.description}</p>

        {/* Buttons */}
        <div className="flex gap-4 pt-2">
          {/* PRIMARY BUTTON */}
          <button className="flex-1 py-3 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2">
            👁️ View Details
          </button>

          {/* SECONDARY */}
          <button className="flex-1 py-3 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-100 transition">
            Edit
          </button>
        </div>
      </div>
    </div>
  );
}
