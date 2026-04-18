'use client';

import { useMemo } from 'react';
import { BudgetFormData } from '@/types/budget';
import { useDepartments } from '@/context/DepartmentsContext';
import { Building2, Calendar, FileText, User, Phone, Mail, AlignLeft } from 'lucide-react';

interface Props {
  formData: BudgetFormData;
  setFormData: React.Dispatch<React.SetStateAction<BudgetFormData>>;
  /** When creating from `/departments/[id]/budget/new`, department is fixed (no dropdown). */
  fixedDepartment?: { id: string; name: string };
}

export default function BasicInfoStep({ formData, setFormData, fixedDepartment }: Props) {
  const { departments } = useDepartments();

  const activeDepartments = departments.filter((d) => d.status === 'active');

  const departmentLocked = Boolean(fixedDepartment?.id);

  const fiscalYearOptions = useMemo(() => {
    const start = new Date().getFullYear();
    const years = Array.from({ length: 12 }, (_, i) => String(start + i));
    const selected = formData.fiscalYear?.trim();
    if (selected && !years.includes(selected)) {
      return [...years, selected].sort((a, b) => Number(a) - Number(b));
    }
    return years;
  }, [formData.fiscalYear]);

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
        <div className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold">
          1
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Basic Information</h2>
          <p className="text-sm text-gray-500">
            Enter the fundamental details of your budget submission
          </p>
        </div>
      </div>

      {/* Row 1: Department, Fiscal Year, Budget Title, Department Head */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        {/* Department */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Building2 size={14} className="text-gray-400" />
            Department <span className="text-red-500">*</span>
          </label>
          {departmentLocked ? (
            <div
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-800 bg-slate-50"
              title="Department is determined by the page you started from"
            >
              {fixedDepartment?.name ?? '—'}
            </div>
          ) : (
            <div className="relative">
              <select
                value={formData.departmentId ?? ''}
                onChange={(e) => setFormData((prev) => ({ ...prev, departmentId: e.target.value }))}
                className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              >
                <option value="">Select Department</option>
                {activeDepartments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                ▾
              </div>
            </div>
          )}
        </div>

        {/* Fiscal Year */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Calendar size={14} className="text-gray-400" />
            Fiscal Year <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              value={formData.fiscalYear}
              onChange={(e) => setFormData((prev) => ({ ...prev, fiscalYear: e.target.value }))}
              autoComplete="off"
              className="w-full appearance-none border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-700 bg-white focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
            >
              {fiscalYearOptions.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              ▾
            </div>
          </div>
        </div>

        {/* Budget Title */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <FileText size={14} className="text-gray-400" />
            Budget Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="eg. Annual ministry budget 2024"
            value={formData.title}
            onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
          />
        </div>

        {/* Department Head */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <User size={14} className="text-gray-400" />
            Department Head <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="budget-department-head"
            placeholder="Primary department head"
            value={formData.departmentHead ?? ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, departmentHead: e.target.value }))}
            autoComplete="off"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
          />
          <p className="text-xs text-gray-400">
            Prefilled from the directory when available; you can change it anytime.
          </p>
        </div>
      </div>

      {/* Row 2: Phone Number, Email Address */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Phone */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Phone size={14} className="text-gray-400" />
            Phone Number
          </label>
          <input
            type="tel"
            name="budget-head-phone"
            placeholder="+233 55 443 5344"
            value={formData.phoneNumber ?? ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, phoneNumber: e.target.value }))}
            autoComplete="off"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
          />
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
            <Mail size={14} className="text-gray-400" />
            Email Address
          </label>
          <input
            type="email"
            name="budget-head-email"
            placeholder="head@example.com"
            value={formData.emailAddress ?? ''}
            onChange={(e) => setFormData((prev) => ({ ...prev, emailAddress: e.target.value }))}
            autoComplete="off"
            className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
          />
        </div>
      </div>

      {/* Row 3: Budget Overview */}
      <div className="space-y-1.5">
        <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
          <AlignLeft size={14} className="text-gray-400" />
          Budget Overview <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={4}
          placeholder="Provide a brief overview of your budget submission and key objectives for the fiscal year"
          value={formData.overview ?? ''}
          onChange={(e) => setFormData((prev) => ({ ...prev, overview: e.target.value }))}
          className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm placeholder:text-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition resize-none"
        />
      </div>
    </div>
  );
}
