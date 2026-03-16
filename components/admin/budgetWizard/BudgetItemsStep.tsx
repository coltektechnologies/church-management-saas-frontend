'use client';

import { Trash2 } from 'lucide-react';
import { BudgetFormData, BudgetItem } from '@/types/budget';

interface Props {
  formData: BudgetFormData;
  setFormData: React.Dispatch<React.SetStateAction<BudgetFormData>>;
}

type Category = 'personnel' | 'programs' | 'equipment' | 'training';

const CATEGORIES: {
  key: Category;
  label: string;
  description: string;
  icon: string;
  iconBg: string;
  addLabel: string;
}[] = [
  {
    key: 'personnel',
    label: 'Personnel & Staff',
    description: 'Including allowances, stipends, and benefits',
    icon: '👥',
    iconBg: 'bg-blue-100',
    addLabel: '+ Add Personnel Item',
  },
  {
    key: 'programs',
    label: 'Programs & Activities',
    description: 'Events, outreach, and ministry programs',
    icon: '📋',
    iconBg: 'bg-green-100',
    addLabel: '+ Add Program Item',
  },
  {
    key: 'equipment',
    label: 'Equipment & Supplies',
    description: 'Materials, equipment, and resources',
    icon: '🔧',
    iconBg: 'bg-orange-100',
    addLabel: '+ Add Equipment Item',
  },
  {
    key: 'training',
    label: 'Training & Development',
    description: 'Workshops, seminars, and certifications',
    icon: '🎓',
    iconBg: 'bg-purple-100',
    addLabel: '+ Add Training Item',
  },
];

export default function BudgetItemsStep({ formData, setFormData }: Props) {
  const addItem = (category: Category) => {
    setFormData((prev) => ({
      ...prev,
      [category]: [
        ...prev[category],
        { id: crypto.randomUUID(), name: '', quantity: 1, unitCost: 0 },
      ],
    }));
  };

  const updateItem = (
    category: Category,
    index: number,
    field: keyof BudgetItem,
    value: string | number
  ) => {
    setFormData((prev) => {
      const updated = [...prev[category]];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, [category]: updated };
    });
  };

  const removeItem = (category: Category, index: number) => {
    setFormData((prev) => ({
      ...prev,
      [category]: prev[category].filter((_, i) => i !== index),
    }));
  };

  const categoryTotal = (category: Category) =>
    formData[category].reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const grandTotal = CATEGORIES.reduce((sum, c) => sum + categoryTotal(c.key), 0);

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
        <div className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold">
          2
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Budget Items</h2>
          <p className="text-sm text-gray-500">Add detailed budget items with cost estimates</p>
        </div>
      </div>

      {/* Category sections */}
      {CATEGORIES.map((cat) => {
        const total = categoryTotal(cat.key);
        const items = formData[cat.key];

        return (
          <div
            key={cat.key}
            className="bg-gray-50 border border-gray-200 rounded-2xl p-6 space-y-4"
          >
            {/* Category header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-xl ${cat.iconBg} flex items-center justify-center text-lg`}
                >
                  {cat.icon}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{cat.label}</p>
                  <p className="text-xs text-gray-500">{cat.description}</p>
                </div>
              </div>
              <div className="text-sm font-semibold text-teal-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg">
                Total: GHS{total.toLocaleString('en', { minimumFractionDigits: 2 })}
              </div>
            </div>

            {/* Column headers — show if there are items */}
            {items.length > 0 && (
              <div className="grid grid-cols-12 gap-3 px-1 text-xs text-gray-400 font-medium">
                <span className="col-span-5">Item Name</span>
                <span className="col-span-2">Quantity</span>
                <span className="col-span-2">Unit Cost</span>
                <span className="col-span-2">Total</span>
                <span className="col-span-1"></span>
              </div>
            )}

            {/* Items */}
            <div className="space-y-3">
              {items.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-3 items-center">
                  <input
                    placeholder="Item name"
                    value={item.name}
                    onChange={(e) => updateItem(cat.key, index, 'name', e.target.value)}
                    className="col-span-5 border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) => updateItem(cat.key, index, 'quantity', Number(e.target.value))}
                    className="col-span-2 border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                  <input
                    type="number"
                    min={0}
                    value={item.unitCost}
                    onChange={(e) => updateItem(cat.key, index, 'unitCost', Number(e.target.value))}
                    className="col-span-2 border border-gray-200 bg-white rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none"
                  />
                  <div className="col-span-2 text-sm font-medium text-gray-700 px-1">
                    GHS{(item.quantity * item.unitCost).toLocaleString()}
                  </div>
                  <button
                    onClick={() => removeItem(cat.key, index)}
                    className="col-span-1 flex items-center justify-center text-gray-400 hover:text-red-500 transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add item button */}
            <button
              onClick={() => addItem(cat.key)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium transition"
            >
              {cat.addLabel}
            </button>
          </div>
        );
      })}

      {/* Budget Summary */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-100 flex items-center justify-center text-lg">
              📊
            </div>
            <div>
              <p className="font-semibold text-gray-900">Budget Summary</p>
              <p className="text-xs text-gray-500">Grand Budget Overview</p>
            </div>
          </div>
          <div className="text-sm font-semibold text-teal-600 bg-teal-50 border border-teal-200 px-3 py-1.5 rounded-lg">
            Grand Total: GHS{grandTotal.toLocaleString('en', { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
          {CATEGORIES.map((cat) => (
            <div key={cat.key}>
              <p className="text-xs text-gray-500">{`Total ${cat.label.split(' ')[0]}`}</p>
              <p className="text-lg font-bold text-gray-900 mt-0.5">
                GHS{categoryTotal(cat.key).toLocaleString('en', { minimumFractionDigits: 2 })}
              </p>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs text-gray-500">GRAND TOTAL</p>
          <p className="text-2xl font-bold text-teal-600 mt-0.5">
            GHS{grandTotal.toLocaleString('en', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}
