'use client';

import { useState } from 'react';
import { Expense } from '@/types/expense';
import SubmitExpenseModal from '../DepartmentDetailsModal/SubmitExpenseModal';
import { Department } from '@/types/Department';

interface Props {
  department: Department;
  expenses: Expense[];
  onSubmitExpense: (expense: Expense) => void;
}

export default function BudgetTab({ department, expenses, onSubmitExpense }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');

  const filteredExpenses = expenses.filter((expense) => {
    if (filter === 'all') {
      return true;
    }
    return expense.status === filter;
  });

  const percentageUsed =
    department.annualBudget === 0
      ? 0
      : Math.min((department.budgetUsed / department.annualBudget) * 100, 100); // replace 10000 with actual annual budget later

  return (
    <div className="space-y-10">
      {/* Budget Overview */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4">
        <h3 className="text-lg font-semibold">Budget Overview</h3>

        <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-500 to-red-500"
            style={{ width: `${percentageUsed}%` }}
          />
        </div>

        <div className="flex justify-between text-sm text-gray-600">
          <span>Used: GHS {department.budgetUsed.toLocaleString()}</span>
          <span>
            Remaining: GHS {(department.annualBudget - department.budgetUsed).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between gap-4">
        <h3 className="text-lg font-semibold">Expense Requests ({expenses.length})</h3>

        <div className="flex gap-2">
          {['all', 'pending', 'approved', 'rejected'].map((type) => (
            <button
              key={type}
              onClick={() => setFilter(type as any)}
              className={`px-3 py-1 text-sm rounded-full transition ${
                filter === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {type}
            </button>
          ))}

          <button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Submit New Expense
          </button>
        </div>
      </div>

      {/* Expense List */}
      <div className="space-y-4">
        {filteredExpenses.length === 0 && (
          <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-10 text-center">
            <div className="text-4xl mb-4">💰</div>
            <h4 className="font-semibold text-gray-800">No Expense Requests</h4>
            <p className="text-gray-500 text-sm mt-2">
              Submitted expenses will appear here awaiting approval.
            </p>
          </div>
        )}

        {filteredExpenses.map((expense) => (
          <div
            key={expense.id}
            className="bg-white border border-gray-200 p-5 rounded-xl hover:shadow-md transition"
          >
            <div className="flex justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{expense.title}</h4>
                <p className="text-sm text-gray-600">{expense.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(expense.submittedAt).toLocaleString()}
                </p>
              </div>

              <div className="text-right space-y-2">
                <div className="text-lg font-semibold">GHS {expense.amount.toLocaleString()}</div>

                <span className="text-xs px-2 py-1 rounded-full bg-yellow-100 text-yellow-700">
                  {expense.status}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <SubmitExpenseModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onCreate={onSubmitExpense}
      />
    </div>
  );
}
