"use client";
import ExpenseRequestForm from "@/components/departments/BudgetAndExpenses/ExpenseRequestForm";
import ExpenseRequestFormHeader from './ExpenseRequestFormHeader';
import { useState } from 'react';

export default function ExpenseRequestEmptyState() {
  const [showForm, setShowForm] = useState(false);

  const handleSubmitBudget = () => {
    setShowForm(true);
  }

  return (
      <div className="relative w-full h-full min-h-[436px] bg-[#ecf1fa] rounded-[10px] p-4">
        <ExpenseRequestFormHeader />

        {showForm ? (
          <ExpenseRequestForm onClose={() => setShowForm(false)} />
        ) : (
          <>
            {/* Message */}
            <div className="text-center mb-12">
              <p className="font-['Poppins',sans-serif] font-normal text-[32px] text-[#0b2a4a] leading-normal">
                Hi, you have zero or no budget so far!
              </p>
            </div>

            {/* CTA Button */}
            <div className="flex items-center justify-center">
              <button
                onClick={handleSubmitBudget}
                className="bg-[#93f5e9] hover:bg-[#7de6d9] hover:cursor-pointer transition-colors duration-200 rounded-[10px] px-8 py-4 sm:px-12 sm:py-6 md:px-16 md:py-8"
              >
                <span className="font-['Poppins',sans-serif] font-medium text-[32px] text-[#0b2a4a] leading-normal whitespace-nowrap">
                  Submit your Budget for the year
                </span>
              </button>
            </div>
          </>
        )}
      </div>
    );
}