'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

import { Department } from '@/types/Department';
import SummaryCard from '@/components/admin/departments/SummaryCard';
import DepartmentCard from '@/components/admin/departments/DepartmentCard';
import CreateDepartmentForm from '@/components/admin/departments/CreateDepartmentForm';
import DepartmentDetailsModal from '@/components/admin/departments/DepartmentDetailsModal/DepartmentDetailsModal';
import { useDepartments } from '@/context/DepartmentsContext';

export default function DepartmentsPage() {
  // ── All department state now comes from context ──
  const {
    departments,
    setDepartments,
    updateDepartment,
    departmentMembersMap,
    setDepartmentMembersMap,
    departmentActivitiesMap,
    addActivity,
    deleteActivity,
    departmentExpensesMap,
    submitExpense,
    updateExpense,
  } = useDepartments();

  // ── UI state stays local to this page ──
  const [formError, setFormError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
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

  // ── Derived stats ──
  const totalDepartments = departments.length;
  const activeDepartments = departments.filter((d) => d.status === 'active').length;
  const inactiveDepartments = departments.filter((d) => d.status === 'inactive').length;
  const totalMembers = departments.reduce((sum, d) => sum + d.members, 0);

  const totalDepartmentHeads = Object.values(departmentMembersMap)
    .flat()
    .filter((m) => m.role === 'Leader').length;

  const filteredDepartments = departments.filter((dept) => {
    const matchesSearch =
      dept.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dept.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dept.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // ── Form handlers ──
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData((prev) => ({ ...prev, icon: reader.result as string }));
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

    if (departments.some((d) => d.code === code && d.id !== editingDepartment?.id)) {
      setFormError('A department with this code already exists.');
      return;
    }

    if (editingDepartment) {
      updateDepartment({
        ...editingDepartment,
        name,
        code,
        description: formData.description.trim(),
        status: formData.status,
        themeColor: formData.themeColor,
        icon: formData.icon,
      });
      setEditingDepartment(null);
    } else {
      const newDepartment: Department = {
        id: Date.now().toString(),
        name,
        code,
        description: formData.description.trim(),
        members: 0,
        activities: 0,
        budgetUsed: 0,
        annualBudget: 0,
        status: formData.status,
        themeColor: formData.themeColor,
        icon: formData.icon,
        dateEstablished: new Date().toISOString(),
        settings: {
          autoApprovalThreshold: 5,
          requiresElderApproval: true,
          weeklySummary: true,
          canSubmitAnnouncements: true,
        },
      };
      setDepartments((prev) => [...prev, newDepartment]);
    }

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
        <SummaryCard
          title="Department Heads"
          value={totalDepartmentHeads}
          color="text-purple-600"
        />
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
            You haven't created any church departments yet. Start by creating your first department
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
              onEdit={(department) => {
                setEditingDepartment(department);
                setFormData({
                  name: department.name,
                  code: department.code,
                  description: department.description,
                  status: department.status,
                  themeColor: department.themeColor,
                  icon: department.icon,
                });
                setShowCreate(true);
              }}
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
        editingDepartment={!!editingDepartment}
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
          onAddActivity={(newActivity) => addActivity(selectedDepartment.id, newActivity)}
          onDeleteActivity={(activityId) => deleteActivity(selectedDepartment.id, activityId)}
          expenses={departmentExpensesMap[selectedDepartment.id] || []}
          onSubmitExpense={(expense) => submitExpense(selectedDepartment.id, expense)}
          onUpdateExpense={(expenseId, updatedExpense) =>
            updateExpense(selectedDepartment.id, expenseId, updatedExpense)
          }
          onClose={() => setSelectedDepartment(null)}
          onUpdateDepartment={(updatedDepartment) => {
            updateDepartment(updatedDepartment);
            setSelectedDepartment(updatedDepartment);
          }}
        />
      )}
    </div>
  );
}
