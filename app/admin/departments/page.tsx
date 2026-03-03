'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

import { Department } from '@/types/Department';
import SummaryCard from '@/components/admin/departments/SummaryCard';
import DepartmentCard from '@/components/admin/departments/DepartmentCard';
import CreateDepartmentForm from '@/components/admin/departments/CreateDepartmentForm';

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
    themeColor: 'navy',
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
    themeColor: 'green',
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
    themeColor: 'purple',
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

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    themeColor: 'navy',
    icon: '🏛️',
  });

  const totalDepartments = departments.length;
  const activeDepartments = departments.filter((d) => d.status === 'active').length;
  const inactiveDepartments = departments.filter((d) => d.status === 'inactive').length;
  const totalMembers = departments.reduce((sum, d) => sum + d.members, 0);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      const imageUrl = reader.result as string;
      setFormData((prev) => ({
        ...prev,
        icon: imageUrl,
      }));
    };

    reader.readAsDataURL(file);
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
      themeColor: 'navy',
      icon: '',
    });

    setShowCreate(false);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600 transition">
          ← Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
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

      {departments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="text-5xl mb-6">🏛️</div>

          <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Departments Yet</h3>

          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven’t created any church departments yet. Start by creating your first department
            to begin managing ministries.
          </p>

          <button
            onClick={() => setShowCreate(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition"
          >
            + Create First Department
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {departments.map((dept) => (
            <DepartmentCard key={dept.id} department={dept} />
          ))}
        </div>
      )}

      <CreateDepartmentForm
        showCreate={showCreate}
        setShowCreate={setShowCreate}
        formData={formData}
        setFormData={setFormData}
        handleChange={handleChange}
        handleIconUpload={handleIconUpload}
        handleCreateDepartment={handleCreateDepartment}
        formRef={formRef}
      />
    </div>
  );
}
