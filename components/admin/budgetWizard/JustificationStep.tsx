'use client';

import { BudgetFormData } from '@/types/budget';
import { Target, TrendingUp, Heart, BarChart2, Users, Calendar } from 'lucide-react';

interface Props {
  formData: BudgetFormData;
  setFormData: React.Dispatch<React.SetStateAction<BudgetFormData>>;
}

const APPROVAL_CHAIN = [
  {
    initials: 'OW',
    name: 'Owusu William',
    role: 'Department Head',
    status: 'Completed',
    avatarBg: 'bg-orange-400',
    statusColor: 'bg-green-100 text-green-700',
  },
  {
    initials: 'DW',
    name: 'David Wilson',
    role: 'Secretary',
    status: 'Current',
    avatarBg: 'bg-blue-500',
    statusColor: 'bg-teal-100 text-teal-700',
  },
  {
    initials: 'JL',
    name: 'Jonas Lantam Gbati',
    role: 'Treasurer',
    status: 'Pending',
    avatarBg: 'bg-teal-600',
    statusColor: 'bg-pink-100 text-pink-700',
  },
];

export default function JustificationStep({ formData, setFormData }: Props) {
  const set =
    (field: keyof BudgetFormData) =>
    (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) =>
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
        <div className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          3
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Budget Justification</h2>
          <p className="text-sm text-gray-500">
            Provide detailed explanations for each budget category
          </p>
        </div>
      </div>

      {/* Fields grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <TextareaField
          icon={<Target size={13} />}
          label="Strategic Objectives"
          required
          placeholder="How does this budget align with the church's strategic objectives?"
          value={formData.strategicObjectives ?? ''}
          onChange={set('strategicObjectives')}
        />
        <TextareaField
          icon={<TrendingUp size={13} />}
          label="Expected Impact"
          required
          placeholder="Describe the expected impact and outcomes of this budget allocation"
          value={formData.expectedImpact ?? ''}
          onChange={set('expectedImpact')}
        />
        <TextareaField
          icon={<Heart size={13} />}
          label="Ministry Benefits"
          required
          placeholder="How will this budget benefit the ministry and church members?"
          value={formData.ministryBenefits ?? ''}
          onChange={set('ministryBenefits')}
        />
        <TextareaField
          icon={<BarChart2 size={13} />}
          label="Previous Year Comparison"
          placeholder="Percentage change from last year"
          value={formData.previousYearComparison ?? ''}
          onChange={set('previousYearComparison')}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InputField
          icon={<Users size={13} />}
          label="Number of Beneficiaries"
          placeholder="Estimated number of beneficiaries"
          value={formData.numberOfBeneficiaries ?? ''}
          onChange={set('numberOfBeneficiaries')}
        />
        <InputField
          icon={<Calendar size={13} />}
          label="Implementation Timeline"
          placeholder="e.g. 2025-05-25"
          value={formData.implementationTimeline ?? ''}
          onChange={set('implementationTimeline')}
        />
      </div>

      {/* Approval Chain Preview */}
      <ApprovalChain />
    </div>
  );
}

export function ApprovalChain() {
  return (
    <div className="border border-gray-200 rounded-2xl p-6 space-y-5">
      <h3 className="font-semibold text-gray-900">Approval Chain Preview</h3>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16">
        {APPROVAL_CHAIN.map((person, i) => (
          <div key={i} className="flex flex-col items-center gap-2">
            <div
              className={`w-14 h-14 rounded-full ${person.avatarBg} text-white flex items-center justify-center text-lg font-bold`}
            >
              {person.initials}
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-gray-900">{person.name}</p>
              <p className="text-xs text-gray-500">{person.role}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${person.statusColor}`}>
              {person.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TextareaField({
  icon,
  label,
  required,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
        {icon}
        {label}
        {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        rows={4}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-gray-400"
      />
    </div>
  );
}

function InputField({
  icon,
  label,
  placeholder,
  value,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
        {icon}
        {label}
      </label>
      <input
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none placeholder:text-gray-400"
      />
    </div>
  );
}
