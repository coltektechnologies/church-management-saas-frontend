'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { Expense } from '@/types/expense';
import { Department } from '@/types/Department';
import { usePermissions } from '@/hooks/usePermissions';

interface Props {
  department: Department;
  expenses: Expense[];
  /** Optional — inline submit; tab uses route to full expense form */
  onSubmitExpense?: (expense: Expense, options: { categoryId: string }) => Promise<unknown>;
}

export default function BudgetTab({ department, expenses }: Props) {
  const router = useRouter();
  const { can } = usePermissions();
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredExpenses = expenses.filter((e) => filter === 'all' || e.status === filter);

  const hasNoBudget = department.annualBudget === 0;
  const percentageUsed = hasNoBudget
    ? 0
    : Math.min((department.budgetUsed / department.annualBudget) * 100, 100);

  return (
    <div className="space-y-8">
      {/* Budget Overview */}
      {hasNoBudget ? (
        <div className="bg-amber-50 dark:bg-amber-950/35 border border-amber-200 dark:border-amber-900 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-amber-800 dark:text-amber-200">
              No Budget Assigned
            </h3>
            <p className="text-sm text-amber-700 dark:text-amber-300/90">
              This department doesn't have an annual budget yet. Submit a budget request to get
              started.
            </p>
          </div>
          {can('canAssignBudget') && (
            <button
              type="button"
              onClick={() => router.push(`/departments/${department.id}/budget/new`)}
              className="flex items-center gap-2 bg-amber-600 dark:bg-amber-500 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-amber-700 dark:hover:bg-amber-400 transition whitespace-nowrap"
            >
              Assign Budget
            </button>
          )}
        </div>
      ) : (
        <div className="bg-muted/30 dark:bg-white/[0.04] border border-[var(--admin-border)] rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Budget Overview</h3>
            <span className="text-sm text-muted-foreground">
              Annual Budget:{' '}
              <span className="font-semibold text-foreground">
                GHS {department.annualBudget.toLocaleString()}
              </span>
            </span>
          </div>
          <div className="w-full h-3 bg-muted dark:bg-white/15 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                percentageUsed >= 90
                  ? 'bg-red-500'
                  : percentageUsed >= 60
                    ? 'bg-amber-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${percentageUsed}%` }}
            />
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>
              Used:{' '}
              <span className="font-medium text-foreground">
                GHS {department.budgetUsed.toLocaleString()}
              </span>
              <span className="ml-1 text-muted-foreground">({percentageUsed.toFixed(0)}%)</span>
            </span>
            <span>
              Remaining:{' '}
              <span className="font-medium text-foreground">
                GHS {(department.annualBudget - department.budgetUsed).toLocaleString()}
              </span>
            </span>
          </div>
        </div>
      )}

      {/* Expenses header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h3 className="text-lg font-semibold text-foreground">
          Expense Requests
          <span className="ml-2 text-sm font-normal text-muted-foreground">
            ({expenses.length})
          </span>
        </h3>
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'approved', 'rejected'] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilter(type)}
              className={`px-3 py-1.5 text-sm rounded-full capitalize transition ${
                filter === type
                  ? 'bg-blue-600 dark:bg-blue-500 text-white'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80 dark:bg-white/10 dark:hover:bg-white/15'
              }`}
            >
              {type}
            </button>
          ))}
          {can('canSubmitExpense') && (
            <button
              type="button"
              onClick={() => router.push(`/departments/${department.id}/expenses/new`)}
              className="bg-blue-600 dark:bg-blue-500 text-white px-4 py-1.5 rounded-full text-sm hover:bg-blue-700 dark:hover:bg-blue-400 transition"
            >
              + Submit Expense
            </button>
          )}
        </div>
      </div>

      {/* Expense list */}
      <div className="space-y-3">
        {filteredExpenses.length === 0 ? (
          <div className="bg-muted/30 dark:bg-white/[0.04] border border-dashed border-[var(--admin-border)] rounded-xl p-10 text-center">
            <div className="text-4xl mb-4">💰</div>
            <h4 className="font-semibold text-foreground">No Expense Requests</h4>
            <p className="text-muted-foreground text-sm mt-2">
              {filter === 'all'
                ? 'Submitted expenses will appear here awaiting approval.'
                : `No ${filter} expenses found.`}
            </p>
          </div>
        ) : (
          filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-[var(--admin-surface)] border border-[var(--admin-border)] p-5 rounded-xl hover:shadow-md dark:shadow-none dark:ring-1 dark:ring-white/10 transition"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="font-semibold text-foreground">{expense.title}</h4>
                    <StatusBadge status={expense.status} />
                  </div>
                  <p className="text-xs font-mono font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-100 dark:border-blue-900 px-2 py-0.5 rounded w-fit">
                    {expense.expenseRef}
                  </p>
                  <p className="text-sm text-muted-foreground">{expense.description}</p>
                  {expense.submitterName && (
                    <p className="text-xs text-muted-foreground">
                      By: <span className="font-medium text-foreground">{expense.submitterName}</span>
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Submitted {new Date(expense.submittedAt).toLocaleString()}
                  </p>
                  {expense.reviewedAt && (
                    <p className="text-xs text-muted-foreground">
                      Reviewed {new Date(expense.reviewedAt).toLocaleString()}
                    </p>
                  )}
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-foreground">
                    GHS {expense.amount.toLocaleString()}
                  </p>
                  {expense.items?.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                      {expense.items.length} item{expense.items.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Expense['status'] }) {
  if (status === 'approved') {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-950/50 dark:text-green-400 font-medium">
        <CheckCircle size={11} /> Approved
      </span>
    );
  }
  if (status === 'rejected') {
    return (
      <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 dark:bg-red-950/50 dark:text-red-400 font-medium">
        <XCircle size={11} /> Rejected
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 font-medium">
      <Clock size={11} /> Pending
    </span>
  );
}
