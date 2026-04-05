"use client";

import React from "react";
import { BudgetOverview } from "@/components/departments/BudgetAndExpenses/BudgetOverview";
import ExpenseRequestEmptyState from "@/components/departments/BudgetAndExpenses/ExpenseRequestEmptyState";
import ExpenseBreakdown from "@/components/departments/BudgetAndExpenses/ExpenseBreakdown";
import ExpenseRequestForm from "@/components/departments/BudgetAndExpenses/ExpenseRequestForm";

interface StatCardProps {
  label: string;
  value: string | number;
}

interface BudgetOverviewProps {
  totalBudget: number;
  spent: number;
  currency?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value }) => (
  <div className="flex flex-col items-center  rounded-lg p-4 w-full">
    <h3 className={`text-xl font-bold ${
      label === "Total Requests" ? "text-blue-600" :
      label === "Pending" ? "text-yellow-600" :
      label === "Draft" ? "text-green-600" :
      label === "Total Requested" ? "text-[#0B2A4A]" :
      "text-black"
    }`}>{value}</h3>
    <p className="text-sm text-gray-600">{label}</p>
  </div>
);



const ExpenseForm: React.FC = () => (
  <div className="mt-6 border border-gray-300 rounded-lg p-6 bg-white shadow-sm">
    <h2 className="text-lg font-semibold mb-2">Expense Request Form</h2>
    <p className="text-gray-600">Fill in the details below to submit a new expense request</p>
    <p className="text-red-600 font-bold mt-2">Hi, you have zero or no budget so far!!</p>
    <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
      Submit your Budget for the year
    </button>
  </div>
);

const BudgetExpenses: React.FC = () => {
  return (
    <div className="p-6 font-sans">
      

      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6 bg-[#CDF6F1] p-5 rounded-lg">
        <StatCard label="Total Requests" value={0} />
        <StatCard label="Pending" value={0} />
        <StatCard label="Draft" value={0} />
        <StatCard label="Total Requested" value="GHS0" />
      </section>

      {/* Budget Overview */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Annual Budget Overview</h2>
        <BudgetOverview totalBudget={250} spent={70} />
      </section>

      {/* Expense Form */}
      <ExpenseRequestEmptyState />
      <ExpenseBreakdown />
      {/* <ExpenseRequestForm /> */}
    </div>
  );
};

export default BudgetExpenses;