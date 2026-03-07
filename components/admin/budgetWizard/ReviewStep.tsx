'use client';

import { BudgetFormData } from '@/types/budget';
import { Department } from '@/types/Department';

interface Props {
  formData: BudgetFormData;
  currentDepartment: Department | undefined;
}

export default function ReviewStep({ formData, currentDepartment }: Props) {
  const categoryTotal = (items: BudgetFormData['personnel']) =>
    items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const grandTotal =
    categoryTotal(formData.personnel) +
    categoryTotal(formData.programs) +
    categoryTotal(formData.equipment) +
    categoryTotal(formData.training);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          5
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Review & Submit</h2>
          <p className="text-sm text-gray-500">
            Review your budget submission before final submission
          </p>
        </div>
      </div>

      {/* Summary box */}
      <div className="border border-gray-200 rounded-2xl overflow-hidden">
        <div className="p-6 space-y-6">
          <p className="font-semibold text-gray-900">Budget Submission Summary</p>

          {/* Top meta */}
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            <div>
              <p className="text-sm text-blue-600 font-medium">Department</p>
              <p className="font-bold text-gray-900 mt-0.5">{currentDepartment?.name ?? '—'}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Fiscal Year</p>
              <p className="font-bold text-gray-900 mt-0.5">{formData.fiscalYear || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Budget Title</p>
              <p className="font-bold text-gray-900 mt-0.5">{formData.title || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Amount</p>
              <p className="font-bold text-teal-600 mt-0.5">
                GHS{grandTotal.toLocaleString('en', { minimumFractionDigits: 0 })}
              </p>
            </div>
          </div>

          {/* Budget breakdown */}
          <div className="border border-gray-100 rounded-xl p-5 space-y-3">
            <p className="font-semibold text-sm text-gray-800">Budget Breakdown</p>
            {[
              { label: 'Personnel:', items: formData.personnel },
              { label: 'Programs:', items: formData.programs },
              { label: 'Equipment:', items: formData.equipment },
              { label: 'Training:', items: formData.training },
            ].map(({ label, items }) => (
              <div key={label} className="flex justify-between text-sm">
                <span className="text-gray-500">{label}</span>
                <span className="text-gray-800">
                  GHS{categoryTotal(items).toLocaleString('en', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
            <div className="border-t border-gray-200 pt-3 flex justify-between font-bold">
              <span className="text-gray-900">GRAND TOTAL:</span>
              <span className="text-teal-600">
                GHS{grandTotal.toLocaleString('en', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-blue-50 rounded-xl px-5 py-4">
            <p className="text-sm text-blue-700 leading-relaxed">
              By submitting this budget, you confirm that all information provided is accurate and
              complete. This request will be forwarded to the approval chain for review.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
