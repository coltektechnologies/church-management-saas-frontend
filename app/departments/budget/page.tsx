'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDepartments } from '@/context/DepartmentsContext';
import { useDepartmentProfile } from '@/components/departments/contexts/DepartmentProfileContext';
import { usePortalDepartment } from '@/hooks/usePortalDepartment';
import { FaClipboardList, FaClock, FaFileAlt, FaCoins } from 'react-icons/fa';
import { CheckCircle, XCircle, Clock, FileEdit, Plus } from 'lucide-react';
import { Expense } from '@/types/expense';

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatDate(dateString: string): string {
  try {
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return '—';
  }
}

function hasDraft(departmentId: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return !!localStorage.getItem(`expense_draft_${departmentId}`);
}

// ── Status badge ──────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Expense['status'] | 'draft' }) {
  if (status === 'approved') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-green-100 text-green-700 font-medium">
        <CheckCircle size={11} /> Approved
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-red-100 text-red-700 font-medium">
        <XCircle size={11} /> Rejected
      </span>
    );
  }
  if (status === 'draft') {
    return (
      <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 font-medium">
        <FileEdit size={11} /> Draft
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-amber-100 text-amber-700 font-medium">
      <Clock size={11} /> Pending
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({
  icon,
  iconBg,
  value,
  label,
}: {
  icon: React.ReactNode;
  iconBg: string;
  value: string | number;
  label: string;
}) {
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-5 flex items-center gap-4 shadow-sm">
      <div
        className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center flex-shrink-0`}
      >
        {icon}
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function BudgetExpensesPage() {
  const router = useRouter();
  const {
    departmentExpensesMap,
    loadDepartmentExpenseRequests,
    syncDepartmentBudgetFromApi,
    loading,
  } = useDepartments();
  const { portalIdentityLoaded } = useDepartmentProfile();
  const department = usePortalDepartment();
  const departmentId = department?.id ?? '';
  const expenses: Expense[] = departmentExpensesMap[departmentId] ?? [];

  useEffect(() => {
    if (!departmentId) {
      return;
    }
    void loadDepartmentExpenseRequests(departmentId);
    void syncDepartmentBudgetFromApi(departmentId);
  }, [departmentId, loadDepartmentExpenseRequests, syncDepartmentBudgetFromApi]);

  const totalRequests = expenses.length;
  const pendingCount = expenses.filter((e) => e.status === 'pending').length;
  const draftExists = hasDraft(departmentId);
  const draftCount = draftExists ? 1 : 0;
  const totalRequested = expenses.reduce((sum, e) => sum + e.amount, 0);

  const hasNoBudget = (department?.annualBudget ?? 0) === 0;
  const budgetPercentage = hasNoBudget
    ? 0
    : Math.min(((department?.budgetUsed ?? 0) / (department?.annualBudget ?? 1)) * 100, 100);

  if (!portalIdentityLoaded || (loading && !department)) {
    return (
      <div className="flex items-center justify-center min-h-full p-8">
        <p className="text-gray-400 text-sm animate-pulse">Loading…</p>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center min-h-full p-8">
        <p className="text-gray-500 text-sm text-center max-w-md">
          No department is linked to your account.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Budget & Expenses</h1>
        <p className="text-sm text-gray-500 mt-1">
          {department.name} · {department.code}
        </p>
      </div>

      {/* Stats header */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={<FaClipboardList size={18} className="text-blue-600" />}
          iconBg="bg-blue-100"
          value={totalRequests}
          label="Total Requests"
        />
        <StatCard
          icon={<FaClock size={18} className="text-amber-500" />}
          iconBg="bg-amber-100"
          value={pendingCount}
          label="Pending"
        />
        <StatCard
          icon={<FaFileAlt size={18} className="text-gray-500" />}
          iconBg="bg-gray-100"
          value={draftCount}
          label="Draft"
        />
        <StatCard
          icon={<FaCoins size={18} className="text-teal-600" />}
          iconBg="bg-teal-100"
          value={`GHS${totalRequested.toLocaleString()}`}
          label="Total Requested"
        />
      </div>

      {/* Budget overview or no-budget state */}
      {hasNoBudget ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center space-y-5 shadow-sm">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center">
            <FaCoins size={28} className="text-teal-500" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-gray-900">
              Hi, you have zero or no budget so far!!
            </h3>
            <p className="text-sm text-gray-500 max-w-sm">
              Submit a budget request for the year to get started. It will be reviewed and approved
              by the appropriate authorities.
            </p>
          </div>
          <button
            onClick={() => router.push(`/departments/${departmentId}/budget/new`)}
            className="bg-teal-500 text-white px-8 py-3 rounded-xl font-semibold text-sm hover:bg-teal-600 transition"
          >
            Submit your Budget for the year
          </button>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-900">Annual Budget Overview</h3>
            <span className="text-sm font-semibold text-teal-600">
              GHS{department.annualBudget.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetPercentage >= 90
                  ? 'bg-red-500'
                  : budgetPercentage >= 60
                    ? 'bg-amber-500'
                    : 'bg-teal-500'
              }`}
              style={{ width: `${budgetPercentage}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Spent:{' '}
              <span className="font-semibold text-gray-800">
                GHS{department.budgetUsed.toLocaleString()}
              </span>
            </span>
            <span>
              Remaining:{' '}
              <span className="font-semibold text-gray-800">
                GHS{(department.annualBudget - department.budgetUsed).toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Expense breakdown */}
      {!hasNoBudget && (
        <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <h3 className="text-base font-semibold text-gray-900">Expense Breakdown</h3>
            <button
              onClick={() => router.push(`/departments/${departmentId}/expenses/new`)}
              className="flex items-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-teal-600 transition"
            >
              <Plus size={15} /> Request Fund
            </button>
          </div>

          {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-6">
              <div className="text-4xl mb-4">😅</div>
              <h4 className="text-base font-semibold text-gray-800">Oops!! No request Yet</h4>
              <p className="text-sm text-gray-500 mt-1">
                Your expense requests will appear here once submitted.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                      Date
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                      Description
                    </th>
                    <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                      Category
                    </th>
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                      Amount
                    </th>
                    <th className="text-center text-xs font-semibold text-gray-500 uppercase tracking-wide px-6 py-3">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {expenses.map((expense) => (
                    <tr key={expense.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                        {formatDate(expense.submittedAt)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-gray-900">{expense.title}</p>
                        {expense.expenseRef && (
                          <p className="text-xs font-mono text-blue-500 mt-0.5">
                            {expense.expenseRef}
                          </p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{expense.category || '—'}</td>
                      <td className="px-6 py-4 text-sm font-semibold text-gray-900 text-right whitespace-nowrap">
                        GHS{expense.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <StatusBadge status={expense.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Draft banner */}
      {draftExists && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileEdit size={18} className="text-amber-600" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                You have an unfinished expense request
              </p>
              <p className="text-xs text-amber-600">Continue filling in your saved draft</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/departments/${departmentId}/expenses/new`)}
            className="text-sm font-medium text-amber-700 hover:text-amber-900 underline transition"
          >
            Continue Draft
          </button>
        </div>
      )}
    </div>
  );
}
