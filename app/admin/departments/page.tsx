'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

import { Department } from '@/types/Department';
import SummaryCard from '@/components/admin/departments/SummaryCard';
import DepartmentCard from '@/components/admin/departments/DepartmentCard';
import CreateDepartmentForm from '@/components/admin/departments/CreateDepartmentForm';
import DepartmentDetailsModal from '@/components/admin/departments/DepartmentDetailsModal/DepartmentDetailsModal';
import { useDepartments } from '@/context/DepartmentsContext';
import {
  buildCreateActivityBodyFromScheduledAt,
  fetchDepartmentDetail,
  parseThemeColor,
} from '@/lib/departmentsApi';
import { getMembers, type MemberListItem } from '@/lib/api';

export default function DepartmentsPage() {
  const {
    departments,
    updateDepartment,
    applyDepartmentDetail,
    refreshDepartments,
    createDepartmentRemote,
    updateDepartmentRemote,
    departmentMembersMap,
    setDepartmentMembersMap,
    departmentActivitiesMap,
    loadDepartmentMembers,
    loadDepartmentActivities,
    loadDepartmentExpenseRequests,
    assignMember,
    addActivityRemote,
    deleteActivityRemote,
    departmentExpensesMap,
    loading,
    error,
    setError,
  } = useDepartments();

  const [formError, setFormError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [savingDepartment, setSavingDepartment] = useState(false);

  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const selectedDepartment = selectedDepartmentId
    ? (departments.find((d) => d.id === selectedDepartmentId) ?? null)
    : null;

  const [churchMembers, setChurchMembers] = useState<MemberListItem[]>([]);

  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showCreate && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [showCreate]);

  useEffect(() => {
    if (!showCreate) {
      setEditingDepartment(null);
    }
  }, [showCreate]);

  useEffect(() => {
    void getMembers().then(setChurchMembers);
  }, []);

  const loadModalData = useCallback(
    async (departmentId: string) => {
      try {
        const detail = await fetchDepartmentDetail(departmentId);
        await Promise.all([
          loadDepartmentMembers(departmentId),
          loadDepartmentActivities(departmentId),
          loadDepartmentExpenseRequests(departmentId),
        ]);
        applyDepartmentDetail(departmentId, detail);
      } catch {
        await Promise.all([
          loadDepartmentMembers(departmentId),
          loadDepartmentActivities(departmentId),
          loadDepartmentExpenseRequests(departmentId),
        ]);
      }
    },
    [
      applyDepartmentDetail,
      loadDepartmentMembers,
      loadDepartmentActivities,
      loadDepartmentExpenseRequests,
    ]
  );

  useEffect(() => {
    if (!selectedDepartmentId) {
      return;
    }
    void loadModalData(selectedDepartmentId);
  }, [selectedDepartmentId, loadModalData]);

  const emptyDepartmentForm = () => ({
    name: '',
    code: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
    themeColor: 'navy' as Department['themeColor'],
    icon: 'prayer',
  });

  const [formData, setFormData] = useState(emptyDepartmentForm);

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

  const handleCreateDepartment = async () => {
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

    setSavingDepartment(true);
    setFormError(null);
    setError(null);

    try {
      if (editingDepartment) {
        await updateDepartmentRemote(editingDepartment.id, {
          name,
          code,
          description: formData.description.trim(),
          status: formData.status,
          themeColor: formData.themeColor,
          icon: formData.icon,
        });
        setEditingDepartment(null);
      } else {
        await createDepartmentRemote({
          name,
          code,
          description: formData.description.trim(),
          status: formData.status,
          themeColor: formData.themeColor,
          icon: formData.icon,
        });
      }

      setFormData(emptyDepartmentForm());
      setShowCreate(false);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not save department');
    } finally {
      setSavingDepartment(false);
    }
  };

  const openEdit = async (department: Department) => {
    setEditingDepartment(department);
    setFormError(null);
    try {
      const detail = await fetchDepartmentDetail(department.id);
      setFormData({
        name: detail.name,
        code: detail.code,
        description: detail.description?.trim() ?? '',
        status: detail.is_active ? 'active' : 'inactive',
        themeColor: parseThemeColor(detail.color),
        icon: detail.icon && !detail.icon.startsWith('data:') ? detail.icon : department.icon,
      });
    } catch {
      setFormData({
        name: department.name,
        code: department.code,
        description: department.description,
        status: department.status,
        themeColor: department.themeColor,
        icon: department.icon,
      });
    }
    setShowCreate(true);
  };

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <Link
          href="/admin"
          className="text-sm text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
        >
          ← Back to Dashboard
        </Link>

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-semibold text-slate-900 dark:text-white tracking-tight">
              Church Departments
            </h1>
            <p className="mt-3 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              Manage and coordinate all ministry departments in your church.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              setEditingDepartment(null);
              setFormError(null);
              setFormData(emptyDepartmentForm());
              setShowCreate(true);
            }}
            className="bg-blue-600 dark:bg-blue-500 text-white px-8 py-4 rounded-2xl text-base font-semibold hover:bg-blue-700 dark:hover:bg-blue-400 shadow-sm hover:shadow-lg transition-all duration-200"
          >
            + Create Department
          </button>
        </div>
      </div>

      {(error || loading) && (
        <div className="rounded-xl border border-[var(--admin-border)] bg-[var(--admin-surface)] px-4 py-3 text-sm text-foreground">
          {loading ? 'Loading departments…' : error}
          {error && (
            <button
              type="button"
              className="ml-3 text-[color:var(--accent-brand)] underline"
              onClick={() => void refreshDepartments()}
            >
              Retry
            </button>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <SummaryCard
          title="Total Departments"
          value={totalDepartments}
          color="text-blue-600 dark:text-blue-400"
        />
        <SummaryCard
          title="Active Departments"
          value={activeDepartments}
          color="text-green-600 dark:text-green-400"
        />
        <SummaryCard
          title="Inactive Departments"
          value={inactiveDepartments}
          color="text-red-600 dark:text-red-400"
        />
        <SummaryCard
          title="Department Heads"
          value={totalDepartmentHeads}
          color="text-purple-600 dark:text-purple-400"
        />
        <SummaryCard
          title="Total Members"
          value={totalMembers}
          color="text-orange-600 dark:text-orange-400"
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <input
          type="text"
          placeholder="Search by name or code..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border border-[var(--admin-border)] bg-[var(--admin-surface)] text-foreground rounded-lg px-4 py-2 w-full md:w-80 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500/80 outline-none placeholder:text-muted-foreground dark:[color-scheme:dark]"
        />
        <select
          title="Department type"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          className="border border-[var(--admin-border)] bg-[var(--admin-surface)] text-foreground rounded-lg px-4 py-2 w-full md:w-48 focus:ring-2 focus:ring-blue-500 dark:focus:ring-emerald-500/80 outline-none dark:[color-scheme:dark]"
        >
          <option value="all">All Departments</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {!loading && filteredDepartments.length === 0 ? (
        <div className="bg-[var(--admin-surface)] border border-[var(--admin-border)] rounded-2xl p-16 text-center shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10">
          <div className="text-5xl mb-6">🏛️</div>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-3">
            No Departments Yet
          </h3>
          <p className="text-muted-foreground mb-8 max-w-md mx-auto">
            You haven&apos;t created any church departments yet. Start by creating your first
            department to begin managing ministries.
          </p>
          <button
            type="button"
            onClick={() => {
              setEditingDepartment(null);
              setFormError(null);
              setFormData(emptyDepartmentForm());
              setShowCreate(true);
            }}
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 dark:hover:bg-blue-400 transition"
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
              onViewDetails={(department) => setSelectedDepartmentId(department.id)}
              onEdit={(department) => void openEdit(department)}
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
        handleCreateDepartment={() => void handleCreateDepartment()}
        formRef={formRef}
        formError={formError}
        editingDepartment={!!editingDepartment}
        saving={savingDepartment}
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
          churchMembers={churchMembers}
          activities={departmentActivitiesMap[selectedDepartment.id] || []}
          onAddActivity={async (payload) => {
            await addActivityRemote(
              selectedDepartment.id,
              buildCreateActivityBodyFromScheduledAt(payload)
            );
          }}
          onDeleteActivity={(activityId) =>
            void deleteActivityRemote(selectedDepartment.id, activityId)
          }
          expenses={departmentExpensesMap[selectedDepartment.id] || []}
          onClose={() => setSelectedDepartmentId(null)}
          onUpdateDepartment={(updatedDepartment) => {
            updateDepartment(updatedDepartment);
          }}
          onAssignMember={async (memberId, role) => {
            await assignMember(selectedDepartment.id, memberId, role);
          }}
          onLeadershipSaved={async () => {
            const detail = await fetchDepartmentDetail(selectedDepartment.id);
            applyDepartmentDetail(selectedDepartment.id, detail);
          }}
        />
      )}
    </div>
  );
}
