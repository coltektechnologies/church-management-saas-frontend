'use client';

import { BudgetFormData } from '@/types/budget';
import { Target, TrendingUp, Heart, BarChart2, Users, Calendar } from 'lucide-react';

interface Props {
  formData: BudgetFormData;
  setFormData: React.Dispatch<React.SetStateAction<BudgetFormData>>;
}

/** Matches backend budget approval order (see program flow / notifications). No placeholder names. */
const APPROVAL_PIPELINE = [
  {
    initials: 'DE',
    role: 'Department Elder',
    detail: 'Reviews first after you submit',
    avatarBg: 'bg-orange-500',
    statusLabel: 'After submission',
    statusColor: 'bg-slate-100 text-slate-700',
  },
  {
    initials: 'SC',
    role: 'Secretariat',
    detail: 'Second approval step',
    avatarBg: 'bg-blue-600',
    statusLabel: 'After submission',
    statusColor: 'bg-slate-100 text-slate-700',
  },
  {
    initials: 'TR',
    role: 'Treasury',
    detail: 'Final approval',
    avatarBg: 'bg-teal-600',
    statusLabel: 'After submission',
    statusColor: 'bg-slate-100 text-slate-700',
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
    <div className="border border-gray-200 rounded-2xl p-6 space-y-4">
      <div>
        <h3 className="font-semibold text-gray-900">Approval chain</h3>
        <p className="text-xs text-gray-500 mt-1 leading-relaxed">
          Your church routes submitted budgets through these roles in order. Specific approvers are
          determined by your church&apos;s assignments—not shown here until the request is live.
        </p>
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-12 lg:gap-16">
        {APPROVAL_PIPELINE.map((step) => (
          <div key={step.role} className="flex flex-col items-center gap-2 max-w-[140px]">
            <div
              className={`w-14 h-14 rounded-full ${step.avatarBg} text-white flex items-center justify-center text-sm font-bold`}
            >
              {step.initials}
            </div>
            <div className="text-center">
              <p className="font-semibold text-sm text-gray-900">{step.role}</p>
              <p className="text-xs text-gray-500 mt-0.5">{step.detail}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium ${step.statusColor}`}>
              {step.statusLabel}
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
