'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useDepartments } from '@/context/DepartmentsContext';
import ExpenseFormPage from '@/components/admin/expenseForm/ExpenseFormPage';

export default function NewExpensePage() {
  const {
    departments,
    departmentExpensesMap,
    submitExpense,
    loading: departmentsLoading,
    loadDepartmentExpenseRequests,
  } = useDepartments();
  const params = useParams();
  const departmentId = params.id as string;

  useEffect(() => {
    if (departmentId) {
      void loadDepartmentExpenseRequests(departmentId);
    }
  }, [departmentId, loadDepartmentExpenseRequests]);

  const department = departments.find((d) => d.id === departmentId);
  const expenses = departmentExpensesMap[departmentId] || [];

  if (departmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-full p-8">
        <p className="text-gray-500">Loading departments…</p>
      </div>
    );
  }

  if (!department) {
    return (
      <div className="flex items-center justify-center min-h-full p-8">
        <p className="text-gray-500">Department not found.</p>
      </div>
    );
  }

  return (
    <ExpenseFormPage
      department={department}
      expenses={expenses}
      onSubmit={async (expense, options) => submitExpense(departmentId, expense, options)}
    />
  );
}
