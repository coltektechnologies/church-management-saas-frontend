'use client';

import { useState, useEffect, useCallback } from 'react';
import SummaryCard from '@/components/admin/departments/SummaryCard';
import DepartmentCard from '@/components/admin/departments/DepartmentCard';
import DepartmentDetailsModal from '@/components/admin/departments/DepartmentDetailsModal/DepartmentDetailsModal';
import { useDepartments } from '@/context/DepartmentsContext';
import {
  buildCreateActivityBodyFromScheduledAt,
  fetchDepartmentDetail,
} from '@/lib/departmentsApi';
import { getMembers, type MemberListItem } from '@/lib/api';

export default function SecretaryDepartmentsPage() {
  const {
    departments,
    updateDepartment,
    applyDepartmentDetail,
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
  } = useDepartments();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string | null>(null);
  const [churchMembers, setChurchMembers] = useState<MemberListItem[]>([]);

  const selectedDepartment = selectedDepartmentId
    ? (departments.find((d) => d.id === selectedDepartmentId) ?? null)
    : null;

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

  return (
    <div className="space-y-10">
      <div className="space-y-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-semibold text-gray-900 tracking-tight">
            Church Departments
          </h1>
          <p className="mt-3 text-lg text-gray-600 max-w-2xl leading-relaxed">
            View and monitor all ministry departments in your church.
          </p>
        </div>
      </div>

      {(error || loading) && (
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
          {loading ? 'Loading departments…' : error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard title="Total Departments" value={totalDepartments} color="text-blue-600" />
        <SummaryCard title="Active Departments" value={activeDepartments} color="text-green-600" />
        <SummaryCard
          title="Inactive Departments"
          value={inactiveDepartments}
          color="text-red-600"
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
          title="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
          className="border border-gray-300 rounded-lg px-4 py-2 w-full md:w-48 focus:ring-2 focus:ring-blue-500 outline-none"
        >
          <option value="all">All Departments</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {!loading && filteredDepartments.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center shadow-sm">
          <div className="text-5xl mb-6">🏛️</div>
          <h3 className="text-2xl font-semibold text-gray-800 mb-3">No Departments Found</h3>
          <p className="text-gray-600 max-w-md mx-auto">
            No departments match your current search or filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredDepartments.map((dept) => (
            <DepartmentCard
              key={dept.id}
              department={dept}
              onViewDetails={(department) => setSelectedDepartmentId(department.id)}
              onEdit={() => {}}
            />
          ))}
        </div>
      )}

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
          onAddActivity={async (activity) => {
            await addActivityRemote(
              selectedDepartment.id,
              buildCreateActivityBodyFromScheduledAt(activity)
            );
          }}
          onDeleteActivity={(id) => void deleteActivityRemote(selectedDepartment.id, id)}
          expenses={departmentExpensesMap[selectedDepartment.id] || []}
          onClose={() => setSelectedDepartmentId(null)}
          onUpdateDepartment={updateDepartment}
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
