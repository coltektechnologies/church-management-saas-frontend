'use client';

import { useParams } from 'next/navigation';
import { useDepartments } from '@/context/DepartmentsContext';
import { Expense } from '@/types/expense';
import ExpenseFormPage from '@/components/admin/expenseForm/ExpenseFormPage';

export default function NewExpensePage() {
  const { departments, departmentExpensesMap, submitExpense } = useDepartments();
  const params = useParams();
  const departmentId = params.id as string;

  const department = departments.find((d) => d.id === departmentId);
  const expenses = departmentExpensesMap[departmentId] || [];

  if (!department) {
    return (
      <div className="flex items-center justify-center min-h-full p-8">
        <p className="text-gray-500">Department not found.</p>
      </div>
    );
  }

  const handleSubmit = (expense: Expense) => {
    submitExpense(departmentId, expense);
  };

  return <ExpenseFormPage department={department} expenses={expenses} onSubmit={handleSubmit} />;
}
