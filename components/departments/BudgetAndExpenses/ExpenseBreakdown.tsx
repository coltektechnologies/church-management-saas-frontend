"use client";
import { useState } from 'react';
import { Menu } from 'lucide-react';

interface Expense {
  id: string;
  date: string;
  description: string;
  category: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
}

export default function App() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleMenuToggle = () => {
    setIsMenuOpen(!isMenuOpen);
    console.log('Menu toggled:', !isMenuOpen);
  };

  const handleRequestFund = () => {
    console.log('Request Fund clicked');
    // Add your request fund logic here
  };

  return (
    <div className="min-h-screen bg-white mt-10 rounded-lg shadow-sm">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={handleMenuToggle}
              className="text-gray-600 hover:text-gray-900 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-2xl font-semibold text-teal-500">
              Expense Breakdown
            </h1>
          </div>
          
          <button
            onClick={handleRequestFund}
            className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2.5 rounded-lg transition-colors font-medium"
          >
            + Request Fund
          </button>
        </div>
      </header>

      {/* Table */}
      <div className="px-6 py-8">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-200">
                <th className="pb-4 pr-4 text-gray-600 font-medium">Date</th>
                <th className="pb-4 pr-4 text-gray-600 font-medium">Description</th>
                <th className="pb-4 pr-4 text-gray-600 font-medium">Category</th>
                <th className="pb-4 pr-4 text-gray-600 font-medium">Amount</th>
                <th className="pb-4 text-gray-600 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {expenses.length === 0 ? (
                <tr>
                  <td colSpan={5} className="pt-20 text-center">
                    <div className="flex items-center justify-center gap-2 text-2xl text-gray-700">
                      <span className="text-3xl">😉</span>
                      <span>Oops!! No request Yet</span>
                    </div>
                  </td>
                </tr>
              ) : (
                expenses.map((expense) => (
                  <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 pr-4">{expense.date}</td>
                    <td className="py-4 pr-4">{expense.description}</td>
                    <td className="py-4 pr-4">{expense.category}</td>
                    <td className="py-4 pr-4">${expense.amount.toFixed(2)}</td>
                    <td className="py-4">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm ${
                          expense.status === 'approved'
                            ? 'bg-green-100 text-green-700'
                            : expense.status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}
                      >
                        {expense.status.charAt(0).toUpperCase() + expense.status.slice(1)}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}