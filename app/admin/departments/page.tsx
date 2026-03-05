'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

import { Department } from '@/types/Department';
import SummaryCard from '@/components/admin/departments/SummaryCard';
import DepartmentCard from '@/components/admin/departments/DepartmentCard';
import CreateDepartmentForm from '@/components/admin/departments/CreateDepartmentForm';
import DepartmentDetailsModal from '@/components/admin/departments/DepartmentDetailsModal/DepartmentDetailsModal';
import { Activity } from '@/types/activity';

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
    dateEstablished: '10/01/2022',
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
    dateEstablished: '10/01/2022',
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
    dateEstablished: '10/01/2022',
  },
];

export default function DepartmentsPage() {
  const [departments, setDepartments] = useState<Department[]>(mockDepartments);
  const [formError, setFormError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');

  const [showCreate, setShowCreate] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const [departmentMembersMap, setDepartmentMembersMap] = useState<
    Record<string, { id: string; name: string; role: string; joinedAt: string }[]>
  >({});
  const [departmentActivitiesMap, setDepartmentActivitiesMap] = useState<
    Record<string, Activity[]>
  >({});
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
    icon: 'prayer',
  });

  const totalDepartments = departments.length;
  const activeDepartments = departments.filter((d) => d.status === 'active').length;
  const inactiveDepartments = departments.filter((d) => d.status === 'inactive').length;
  const totalMembers = departments.reduce((sum, d) => sum + d.members, 0);

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;

    return matchesSearch && matchesStatus;
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
    const name = formData.name.trim();
    const code = formData.code.trim().toUpperCase();

    if (!name || !code || !formData.themeColor || !formData.icon) {
      setFormError('Fill all required fields.');
      return;
    }

    if (departments.some((d) => d.code === code)) {
      setFormError('A department with this code already exists.');
      return;
    }

    const newDepartment: Department = {
      id: Date.now().toString(),
      name,
      code,
      description: formData.description.trim(),
      members: 0,
      activities: 0,
      budgetUsed: 0,
      status: formData.status,
      themeColor: formData.themeColor,
      icon: formData.icon,
      dateEstablished: new Date().toISOString(),
    };

    setDepartments((prev) => [...prev, newDepartment]);

    setFormData({
      name: '',
      code: '',
      description: '',
      status: 'active',
      themeColor: 'navy',
      icon: 'prayer',
    });

    setFormError(null);
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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-80 focus:ring-2 focus:ring-blue-500 outline-none"
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-48 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">All Departments</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {filteredDepartments.length === 0 ? (
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
          {filteredDepartments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              onViewDetails={(department) => setSelectedDepartment(department)}
            />
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
        formError={formError}
      />
      {selectedDepartment && (
        <DepartmentDetailsModal
          department={selectedDepartment}
          departmentMembers={departmentMembersMap[selectedDepartment.id] || []}
          setDepartmentMembers={(members) => {
            setDepartmentMembersMap((prev) => ({
              ...prev,
              [selectedDepartment.id]:
                typeof members === 'function'
                  ? members(prev[selectedDepartment.id] || [])
                  : members,
            }));
          }}
          activities={departmentActivitiesMap[selectedDepartment.id] || []}
          onAddActivity={(newActivity) => {
            setDepartmentActivitiesMap((prev) => ({
              ...prev,
              [selectedDepartment.id]: [...(prev[selectedDepartment.id] || []), newActivity],
            }));
          }}
          onClose={() => setSelectedDepartment(null)}
          onUpdateDepartment={(updatedDepartment) => {
            setDepartments((prev) =>
              prev.map((dept) => (dept.id === updatedDepartment.id ? updatedDepartment : dept))
            );

            setSelectedDepartment(updatedDepartment);
          }}
        />
      )}
    </div>
  );
}
