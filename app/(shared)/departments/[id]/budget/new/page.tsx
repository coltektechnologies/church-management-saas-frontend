'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { X, Printer, Save, Eye, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react';
import { BudgetFormData } from '@/types/budget';
import BasicInfoStep from '@/components/admin/budgetWizard/BasicInfoStep';
import BudgetItemsStep from '@/components/admin/budgetWizard/BudgetItemsStep';
import JustificationStep from '@/components/admin/budgetWizard/JustificationStep';
import DocumentsStep from '@/components/admin/budgetWizard/DocumentsStep';
import ReviewStep from '@/components/admin/budgetWizard/ReviewStep';
import BudgetDashboardHeader from '@/components/admin/budgetWizard/BudgetDashboardHeader';
import { useDepartments } from '@/context/DepartmentsContext';
import { submitProgramBudgetWizard } from '@/lib/programBudgetApi';
import { useAuth } from '@/context/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';

const STEPS = ['Basic Info', 'Budget Items', 'Justification', 'Documents', 'Review'];

function loadDraft(departmentId: string): Partial<BudgetFormData> {
  if (typeof window === 'undefined') {
    return {};
  }
  try {
    const saved = localStorage.getItem(`budget_draft_${departmentId}`);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

export default function BudgetWizardPage() {
  const { departments, budgetRequests, syncDepartmentBudgetFromApi } = useDepartments();
  const { role } = useAuth();
  const { can } = usePermissions();
  const params = useParams();
  const router = useRouter();

  const departmentId = params.id as string;

  // ── ALL hooks declared before any early return ──
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [draftSaved, setDraftSaved] = useState(false);
  const [stepError, setStepError] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Lazy initializer — reads draft from localStorage once on mount, no useEffect needed
  const [formData, setFormData] = useState<BudgetFormData>(() => {
    const { documents: _ignored, ...draft } = loadDraft(departmentId);
    return {
      title: '',
      fiscalYear: '',
      departmentId: departmentId ?? '',
      departmentHead: '',
      phoneNumber: '',
      emailAddress: '',
      overview: '',
      personnel: [],
      programs: [],
      equipment: [],
      training: [],
      strategicObjectives: '',
      expectedImpact: '',
      ministryBenefits: '',
      previousYearComparison: '',
      numberOfBeneficiaries: '',
      implementationTimeline: '',
      justification: '',
      documents: [],
      ...draft,
    };
  });

  // ── Route guard — AFTER all hooks ──
  if (!can('canAssignBudget')) {
    router.replace(`/${role}/departments`);
    return null;
  }

  const currentDepartment = departments.find((d) => d.id === departmentId);

  const categoryTotal = (items: BudgetFormData['personnel']) =>
    items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const grandTotal =
    categoryTotal(formData.personnel) +
    categoryTotal(formData.programs) +
    categoryTotal(formData.equipment) +
    categoryTotal(formData.training);

  const validateStep = (currentStep: number): string => {
    if (currentStep === 1) {
      if (!formData.departmentId) {
        return 'Please select a department.';
      }
      if (!formData.fiscalYear) {
        return 'Please select a fiscal year.';
      }
      if (!formData.title.trim()) {
        return 'Please enter a budget title.';
      }
      if (!formData.departmentHead?.trim()) {
        return 'Please enter the department head name.';
      }
      if (!formData.overview?.trim()) {
        return 'Please provide a budget overview.';
      }
    }
    if (currentStep === 2) {
      const allItems = [
        ...formData.personnel,
        ...formData.programs,
        ...formData.equipment,
        ...formData.training,
      ];
      if (allItems.length === 0) {
        return 'Please add at least one budget item before proceeding.';
      }
    }
    if (currentStep === 3) {
      if (!formData.strategicObjectives?.trim()) {
        return 'Please fill in the Strategic Objectives field.';
      }
      if (!formData.expectedImpact?.trim()) {
        return 'Please fill in the Expected Impact field.';
      }
      if (!formData.ministryBenefits?.trim()) {
        return 'Please fill in the Ministry Benefits field.';
      }
    }
    return '';
  };

  const handleNext = () => {
    const error = validateStep(step);
    if (error) {
      setStepError(error);
      return;
    }
    setStepError('');
    setSubmitError('');
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleSaveDraft = () => {
    const { documents: _documents, ...rest } = formData;
    localStorage.setItem(`budget_draft_${departmentId}`, JSON.stringify(rest));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleSubmit = async () => {
    if (!currentDepartment || submitting) {
      return;
    }
    const err1 = validateStep(1);
    const err2 = validateStep(2);
    const err3 = validateStep(3);
    const firstError = err1 || err2 || err3;
    if (firstError) {
      setSubmitError(firstError);
      return;
    }
    setSubmitError('');
    setSubmitting(true);
    try {
      await submitProgramBudgetWizard(departmentId, formData);
      await syncDepartmentBudgetFromApi(departmentId);
      localStorage.removeItem(`budget_draft_${departmentId}`);
      setSubmitted(true);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Failed to submit budget');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-6">
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center space-y-4 max-w-lg w-full shadow-sm">
          <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle size={32} className="text-teal-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900">Budget Submitted!</h2>
          <p className="text-gray-500">
            The budget request for{' '}
            <span className="font-medium text-gray-800">{currentDepartment?.name}</span> of{' '}
            <span className="font-medium text-gray-800">GHS {grandTotal.toLocaleString()}</span> is
            now <span className="font-medium text-orange-600">pending review</span>. The annual
            budget will update once approved by the approval chain.
          </p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-3 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
          >
            Back to Departments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Back */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-800 transition"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <BudgetDashboardHeader
          departments={departments}
          fiscalYear={formData.fiscalYear}
          budgetRequests={budgetRequests}
        />

        {/* Stepper */}
        <div className="bg-white border border-gray-200 rounded-2xl px-6 py-6 shadow-sm">
          <div className="flex items-center justify-center overflow-x-auto">
            <div className="flex items-center min-w-max">
              {STEPS.map((label, i) => {
                const s = i + 1;
                const isActive = step === s;
                const isCompleted = step > s;
                return (
                  <div key={s} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-200
                          ${isCompleted ? 'bg-teal-500 border-2 border-teal-500 text-white' : ''}
                          ${isActive ? 'bg-teal-500 border-[3px] border-blue-600 text-white shadow-md' : ''}
                          ${!isActive && !isCompleted ? 'border-2 border-gray-300 text-gray-400 bg-white' : ''}
                        `}
                      >
                        {isCompleted ? '✓' : s}
                      </div>
                      <span
                        className={`text-xs mt-2 whitespace-nowrap font-medium ${
                          isActive
                            ? 'text-blue-600'
                            : isCompleted
                              ? 'text-teal-600'
                              : 'text-gray-400'
                        }`}
                      >
                        {label}
                      </span>
                    </div>
                    {i < STEPS.length - 1 && (
                      <div
                        className={`w-16 sm:w-20 h-0.5 mb-5 mx-2 transition-all duration-200 ${
                          isCompleted ? 'bg-teal-500' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Department indicator + draft saved */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 px-1">
          {currentDepartment && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Submitting budget for:</span>
              <span className="font-semibold text-gray-800">{currentDepartment.name}</span>
            </div>
          )}
          {draftSaved && (
            <p className="text-sm text-green-600 bg-green-50 border border-green-200 px-3 py-1.5 rounded-lg w-fit">
              ✓ Draft saved successfully
            </p>
          )}
        </div>

        {/* Form Area */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          {step === 1 && <BasicInfoStep formData={formData} setFormData={setFormData} />}
          {step === 2 && <BudgetItemsStep formData={formData} setFormData={setFormData} />}
          {step === 3 && <JustificationStep formData={formData} setFormData={setFormData} />}
          {step === 4 && <DocumentsStep formData={formData} setFormData={setFormData} />}
          {step === 5 && <ReviewStep formData={formData} currentDepartment={currentDepartment} />}
        </div>

        {/* Validation error */}
        {(stepError || submitError) && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl">
            ⚠️ {stepError || submitError}
          </p>
        )}

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-8">
          <button
            disabled={step === 1}
            onClick={() => {
              setStepError('');
              setStep((prev) => Math.max(prev - 1, 1));
            }}
            className="flex items-center justify-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition bg-white"
          >
            <ChevronLeft size={16} /> Previous
          </button>
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <button
              onClick={handleSaveDraft}
              className="flex items-center gap-2 px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition bg-white"
            >
              <Save size={15} /> Save Draft
            </button>
            <button
              onClick={() => setShowPreview(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-500 text-white rounded-xl text-sm font-medium hover:bg-teal-600 transition"
            >
              <Eye size={15} /> Preview
            </button>
            {step < 5 ? (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition"
              >
                Next <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                disabled={submitting}
                onClick={() => void handleSubmit()}
                className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Submitting…' : 'Submit Budget'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowPreview(false)}
          />
          <div className="relative bg-white w-full max-w-2xl max-h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Budget Preview</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Read-only summary of your current submission
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                  <Printer size={13} /> Print
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-gray-900">
                    {formData.title || 'Untitled Budget'}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {currentDepartment?.name} · FY {formData.fiscalYear || '—'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-400">Grand Total</p>
                  <p className="text-2xl font-bold text-teal-600">
                    GHS{grandTotal.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Department Head', value: formData.departmentHead },
                  { label: 'Phone Number', value: formData.phoneNumber },
                  { label: 'Email Address', value: formData.emailAddress },
                  { label: 'Implementation Timeline', value: formData.implementationTimeline },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-gray-50 rounded-xl p-3">
                    <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
                    <p className="text-sm font-medium text-gray-800 mt-0.5">{value || '—'}</p>
                  </div>
                ))}
              </div>

              {formData.overview && (
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                    Budget Overview
                  </p>
                  <p className="text-sm text-gray-700 leading-relaxed">{formData.overview}</p>
                </div>
              )}

              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-800">Budget Breakdown</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {[
                    { label: 'Personnel & Staff', items: formData.personnel, icon: '👥' },
                    { label: 'Programs & Activities', items: formData.programs, icon: '📋' },
                    { label: 'Equipment & Supplies', items: formData.equipment, icon: '🔧' },
                    { label: 'Training & Development', items: formData.training, icon: '🎓' },
                  ].map(({ label, items, icon }) => {
                    const total = categoryTotal(items);
                    return (
                      <div key={label}>
                        <div className="flex items-center justify-between px-4 py-3 bg-white">
                          <div className="flex items-center gap-2">
                            <span className="text-base">{icon}</span>
                            <span className="text-sm font-medium text-gray-700">{label}</span>
                            <span className="text-xs text-gray-400">
                              ({items.length} item{items.length !== 1 ? 's' : ''})
                            </span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800">
                            GHS{total.toLocaleString('en', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        {items.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between px-8 py-2 bg-gray-50 text-xs text-gray-500"
                          >
                            <span>{item.name || 'Unnamed item'}</span>
                            <span>
                              {item.quantity} × GHS{item.unitCost.toLocaleString()} = GHS
                              {(item.quantity * item.unitCost).toLocaleString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-between px-4 py-4 bg-teal-50 border-t border-teal-200">
                  <span className="font-bold text-gray-900">GRAND TOTAL</span>
                  <span className="font-bold text-teal-600 text-lg">
                    GHS{grandTotal.toLocaleString('en', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>

              {(formData.strategicObjectives ||
                formData.expectedImpact ||
                formData.ministryBenefits) && (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-800">Justification</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Strategic Objectives', value: formData.strategicObjectives },
                      { label: 'Expected Impact', value: formData.expectedImpact },
                      { label: 'Ministry Benefits', value: formData.ministryBenefits },
                      { label: 'Previous Year Comparison', value: formData.previousYearComparison },
                    ]
                      .filter((f) => f.value)
                      .map(({ label, value }) => (
                        <div key={label} className="bg-gray-50 rounded-xl p-3">
                          <p className="text-xs text-gray-400 uppercase tracking-wide mb-1">
                            {label}
                          </p>
                          <p className="text-sm text-gray-700">{value}</p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {formData.documents.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-semibold text-gray-800">
                    Supporting Documents ({formData.documents.length})
                  </p>
                  {formData.documents.map((doc, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg"
                    >
                      <span>📎</span>
                      <span>{doc.name}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                <p className="text-xs text-orange-700 leading-relaxed">
                  ⏳ After submission, this budget request will be <strong>pending review</strong>{' '}
                  by the approval chain. Your department's annual budget will only update once it
                  has been fully approved.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setShowPreview(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
              >
                Close
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={() => {
                  setShowPreview(false);
                  if (step === 5) {
                    void handleSubmit();
                  } else {
                    setStep(5);
                  }
                }}
                className="px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {step === 5 ? (submitting ? 'Submitting…' : 'Submit Budget') : 'Go to Review'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
