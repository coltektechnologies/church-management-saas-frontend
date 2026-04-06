import { useState } from 'react';
import svgPaths from '../../imports/svg-gp3cr8pulf';

interface FormData {
  department: string;
  fiscalYear: string;
  phoneNumber: string;
  emailAddress: string;
  budgetTitle: string;
  departmentHead: string;
  budgetOverview: string;
}

const DEPARTMENTS = [
  'Finance Department',
  'Human Resources',
  'IT Department',
  'Marketing Department',
  'Operations Department',
  'Sales Department',
];

const FISCAL_YEARS = ['2022', '2023', '2024', '2025'];

export function BudgetSubmissionForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [showDepartmentDropdown, setShowDepartmentDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    department: '',
    fiscalYear: '2022',
    phoneNumber: '',
    emailAddress: '',
    budgetTitle: '',
    departmentHead: '',
    budgetOverview: '',
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveDraft = () => {
    console.log('Saving draft...', formData);
    alert('Draft saved successfully!');
  };

  const handlePreview = () => {
    console.log('Previewing...', formData);
    alert('Opening preview...');
  };

  const handleNext = () => {
    // Validate required fields
    if (
      !formData.department ||
      !formData.budgetTitle ||
      !formData.departmentHead ||
      !formData.budgetOverview
    ) {
      alert('Please fill in all required fields (marked with *)');
      return;
    }
    console.log('Moving to next step...', formData);
    alert('Moving to step 2: Budget Items');
    setCurrentStep(2);
  };

  const steps = [
    { number: 1, label: 'Basic Info', active: true },
    { number: 2, label: 'Budget Items', active: false },
    { number: 3, label: 'Justification', active: false },
    { number: 4, label: 'Documents', active: false },
    { number: 5, label: 'Review', active: false },
  ];

  return (
    <div className="relative min-h-screen w-full bg-[#e8ecf0] py-[35px] px-[60px]">
      {/* Header Section */}
      <div className="relative">
        <div className="flex items-center gap-[12px]">
          {/* Icon */}
          <div className="relative size-[40px] bg-[#d9d9d9] rounded-[10px] flex items-center justify-center">
            <svg className="size-[25px]" fill="none" preserveAspectRatio="none" viewBox="0 0 25 25">
              <path d={svgPaths.p4022d80} fill="#0B2A4A" />
            </svg>
          </div>

          {/* Title and Description */}
          <div>
            <h1 className="font-['Poppins'] font-medium text-[24px] text-[#0b2a4a]">
              Budget Submission
            </h1>
            <p className="font-['Poppins'] font-light text-[12px] text-black">
              Create and submit annual budget requests for your department
            </p>
          </div>
        </div>

        {/* Fiscal Year Badge */}
        <div className="absolute top-0 right-0">
          <button className="bg-gradient-to-r from-[#0b2a4a] to-[#1982ee] h-[56px] rounded-[50px] px-[27px] flex items-center gap-[13px]">
            <svg className="size-[25px]" fill="none" viewBox="0 0 25 25">
              <path d={svgPaths.p2cafdd00} fill="#E3E3E3" />
            </svg>
            <span className="font-['Poppins'] text-[16px] text-white">Fiscal Year 2024</span>
          </button>
        </div>
      </div>

      {/* Statistics Section */}
      <div className="mt-[45px] bg-[#cdf6f1] rounded-[10px] py-[26px] px-[40px]">
        <div className="flex justify-between">
          <div className="text-center">
            <p className="font-['Poppins'] font-bold text-[24px] text-[#1a7ade] mb-[4px]">0</p>
            <p className="font-['Poppins'] text-[16px] text-[#413b3b]">Total Requests</p>
          </div>
          <div className="text-center">
            <p className="font-['Poppins'] font-bold text-[24px] text-[#8d8206] mb-[4px]">0</p>
            <p className="font-['Poppins'] text-[15px] text-[#413b3b]">Pending</p>
          </div>
          <div className="text-center">
            <p className="font-['Poppins'] font-bold text-[24px] text-[#09a30c] mb-[4px]">0</p>
            <p className="font-['Poppins'] text-[16px] text-[#413b3b]">Draft</p>
          </div>
          <div className="text-center">
            <p className="font-['Poppins'] font-bold text-[24px] text-[#0b2a4a] mb-[4px]">GHS0</p>
            <p className="font-['Poppins'] text-[16px] text-[#413b3b]">Total Requested</p>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="mt-[60px] flex items-center justify-center gap-[80px]">
        {steps.map((step, index) => (
          <div key={step.number} className="flex flex-col items-center">
            <div
              className={`relative size-[45px] rounded-full flex items-center justify-center border-2 ${
                step.active ? 'bg-gradient-to-b from-[#2FC4B2] to-[#08FEE0]' : 'bg-[#DDE1E6]'
              }`}
              style={{
                borderImage: step.active
                  ? 'linear-gradient(to bottom, #0B2A4A, #0C83FF) 1'
                  : 'none',
                borderColor: step.active ? 'transparent' : 'transparent',
              }}
            >
              <p
                className={`font-['Poppins'] font-bold text-[20px] ${
                  step.active ? 'text-white' : 'text-[#0b2a4a]'
                }`}
              >
                {step.number}
              </p>
            </div>
            <p
              className={`mt-[4px] font-['Poppins'] font-medium text-[${step.active ? '15' : '16'}px] ${
                step.active ? 'text-[#089e8c]' : 'text-[#9c9f9f]'
              }`}
            >
              {step.label}
            </p>
          </div>
        ))}
      </div>

      {/* Main Form Section */}
      <div className="mt-[50px] bg-white rounded-[12px] p-[40px] mx-auto max-w-[1400px]">
        {/* Form Header */}
        <div className="flex items-center gap-[16px] mb-[32px]">
          <div className="size-[45px] rounded-full bg-gradient-to-b from-[#2FC4B2] to-[#08FEE0] flex items-center justify-center border-2">
            <p className="font-['Poppins'] font-bold text-[20px] text-white">1</p>
          </div>
          <div>
            <h2 className="font-['Poppins'] font-medium text-[24px] text-[#0b2a4a]">
              Basic Information
            </h2>
            <p className="font-['Poppins'] text-[15px] text-[#717171]">
              Enter the fundamental details of your budget submission
            </p>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-2 gap-x-[40px] gap-y-[28px]">
          {/* Department Field */}
          <div className="relative">
            <label className="flex items-center gap-[4px] mb-[8px]">
              <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                <path d={svgPaths.p360db80} fill="#052D56" />
              </svg>
              <span className="font-['OV_Soge'] font-medium text-[12px] text-[#0b2a4a] tracking-[0.6px]">
                Department
              </span>
              <span className="font-['OV_Soge'] text-[14.4px] text-[#ff0d0d] tracking-[1.152px]">
                *
              </span>
            </label>
            <div className="relative">
              <button
                onClick={() => {
                  setShowDepartmentDropdown(!showDepartmentDropdown);
                  setShowYearDropdown(false);
                }}
                className="w-full h-[37px] bg-white border border-[#ddd] rounded-[8px] px-[20px] flex items-center justify-between"
              >
                <div className="flex items-center gap-[15px]">
                  <svg className="size-[18px]" fill="none" viewBox="0 0 19.4453 18">
                    <path d={svgPaths.p1a9fa0} fill="#637997" />
                  </svg>
                  <span className="font-['Poppins'] text-[12px] text-black">
                    {formData.department || 'Select Departments'}
                  </span>
                </div>
                <svg className="size-[16px]" fill="none" viewBox="0 0 13.0625 7.0213">
                  <path d={svgPaths.p1af6c700} fill="#000" />
                </svg>
              </button>
              {showDepartmentDropdown && (
                <div className="absolute z-10 mt-[4px] w-full bg-white border border-[#ddd] rounded-[8px] shadow-lg max-h-[200px] overflow-y-auto">
                  {DEPARTMENTS.map((dept) => (
                    <button
                      key={dept}
                      onClick={() => {
                        handleInputChange('department', dept);
                        setShowDepartmentDropdown(false);
                      }}
                      className="w-full px-[20px] py-[10px] text-left hover:bg-[#f0f0f0] font-['Poppins'] text-[12px] text-black"
                    >
                      {dept}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Fiscal Year Field */}
          <div className="relative">
            <label className="flex items-center gap-[4px] mb-[8px]">
              <svg className="size-[18px]" fill="none" viewBox="0 0 20 20">
                <path d={svgPaths.p24b5e200} fill="#173660" />
              </svg>
              <span className="font-['OV_Soge'] font-medium text-[12px] text-[#0b2a4a] tracking-[0.6px]">
                Fiscal Year
              </span>
              <span className="font-['OV_Soge'] text-[14.4px] text-[#ff0d0d] tracking-[1.152px]">
                *
              </span>
            </label>
            <div className="relative">
              <button
                onClick={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowDepartmentDropdown(false);
                }}
                className="w-full h-[37px] bg-white border border-[#ddd] rounded-[8px] px-[20px] flex items-center justify-between"
              >
                <div className="flex items-center gap-[15px]">
                  <svg className="size-[18px]" fill="none" viewBox="0 0 20 20">
                    <path d={svgPaths.p24b5e200} fill="#173660" />
                  </svg>
                  <span className="font-['Poppins'] text-[12px] text-black">
                    {formData.fiscalYear}
                  </span>
                </div>
                <svg className="size-[16px]" fill="none" viewBox="0 0 13.0625 7.0213">
                  <path d={svgPaths.p1af6c700} fill="#000" />
                </svg>
              </button>
              {showYearDropdown && (
                <div className="absolute z-10 mt-[4px] w-full bg-white border border-[#ddd] rounded-[8px] shadow-lg">
                  {FISCAL_YEARS.map((year) => (
                    <button
                      key={year}
                      onClick={() => {
                        handleInputChange('fiscalYear', year);
                        setShowYearDropdown(false);
                      }}
                      className="w-full px-[20px] py-[10px] text-left hover:bg-[#f0f0f0] font-['Poppins'] text-[12px] text-black"
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Phone Number Field */}
          <div>
            <label className="flex items-center gap-[4px] mb-[8px]">
              <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                <path d={svgPaths.p1a73a200} fill="#173660" />
              </svg>
              <span className="font-['OV_Soge'] font-medium text-[12px] text-[#0b2a4a] tracking-[0.6px]">
                Phone Number
              </span>
            </label>
            <div className="relative">
              <div className="absolute left-[12px] top-[50%] -translate-y-1/2">
                <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                  <path d={svgPaths.p1a73a200} fill="#173660" fillOpacity="0.69" />
                </svg>
              </div>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                placeholder="+233 59 603 8258"
                className="w-full h-[37px] bg-white border border-[#ddd] rounded-[8px] pl-[44px] pr-[20px] font-['OV_Soge'] text-[11px] text-[#afafaf] tracking-[0.55px]"
              />
            </div>
          </div>

          {/* Email Address Field */}
          <div>
            <label className="flex items-center gap-[4px] mb-[8px]">
              <svg className="size-[18px]" fill="none" viewBox="0 0 18 18">
                <path d={svgPaths.p20d3c300} fill="#173660" />
              </svg>
              <span className="font-['OV_Soge'] font-medium text-[12px] text-[#0b2a4a] tracking-[0.6px]">
                Email Address
              </span>
            </label>
            <div className="relative">
              <div className="absolute left-[12px] top-[50%] -translate-y-1/2">
                <svg className="size-[18px]" fill="none" viewBox="0 0 18 18">
                  <path d={svgPaths.p20d3c300} fill="#173660" fillOpacity="0.66" />
                </svg>
              </div>
              <input
                type="email"
                value={formData.emailAddress}
                onChange={(e) => handleInputChange('emailAddress', e.target.value)}
                placeholder="eg, Annual ministry budget 2024"
                className="w-full h-[37px] bg-white border border-[#ddd] rounded-[8px] pl-[44px] pr-[20px] font-['OV_Soge'] text-[11px] text-[#afafaf] tracking-[0.55px]"
              />
            </div>
          </div>

          {/* Budget Title Field */}
          <div>
            <label className="flex items-center gap-[4px] mb-[8px]">
              <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                <path d={svgPaths.p381c1b80} fill="#173660" />
              </svg>
              <span className="font-['OV_Soge'] font-medium text-[12px] text-[#0b2a4a] tracking-[0.6px]">
                Budget Title
              </span>
              <span className="font-['OV_Soge'] text-[14.4px] text-[#ff0d0d] tracking-[1.152px]">
                *
              </span>
            </label>
            <div className="relative">
              <div className="absolute left-[12px] top-[50%] -translate-y-1/2">
                <svg className="size-[18px]" fill="none" viewBox="0 0 18 18">
                  <path d={svgPaths.p3915e600} fill="#173660" fillOpacity="0.77" />
                </svg>
              </div>
              <input
                type="text"
                value={formData.budgetTitle}
                onChange={(e) => handleInputChange('budgetTitle', e.target.value)}
                placeholder="eg, Annual ministry budget 2024"
                className="w-full h-[37px] bg-white border border-[#ddd] rounded-[8px] pl-[44px] pr-[20px] font-['OV_Soge'] text-[11px] text-[#afafaf] tracking-[0.55px]"
              />
            </div>
          </div>

          {/* Department Head Field */}
          <div>
            <label className="flex items-center gap-[4px] mb-[8px]">
              <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                <path d={svgPaths.p33f64000} fill="#173660" />
              </svg>
              <span className="font-['OV_Soge'] font-medium text-[12px] text-[#0b2a4a] tracking-[0.6px]">
                Department Head
              </span>
              <span className="font-['OV_Soge'] text-[14.4px] text-[#ff0d0d] tracking-[1.152px]">
                *
              </span>
            </label>
            <div className="relative">
              <div className="absolute left-[12px] top-[50%] -translate-y-1/2">
                <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
                  <path d={svgPaths.p33f64000} fill="#173660" fillOpacity="0.55" />
                </svg>
              </div>
              <input
                type="text"
                value={formData.departmentHead}
                onChange={(e) => handleInputChange('departmentHead', e.target.value)}
                placeholder="Pastor William Owusu"
                className="w-full h-[37px] bg-white border border-[#ddd] rounded-[8px] pl-[44px] pr-[20px] font-['OV_Soge'] text-[11px] text-[#afafaf] tracking-[0.55px]"
              />
            </div>
          </div>
        </div>

        {/* Budget Overview Field - Full Width */}
        <div className="mt-[28px]">
          <label className="flex items-center gap-[4px] mb-[8px]">
            <svg className="size-[18px]" fill="none" viewBox="0 0 18 18">
              <path d={svgPaths.p2df072} fill="#173660" />
            </svg>
            <span className="font-['OV_Soge'] font-medium text-[12px] text-[#0b2a4a] tracking-[0.6px]">
              Budget Overview
            </span>
            <span className="font-['OV_Soge'] text-[14.4px] text-[#ff0d0d] tracking-[1.152px]">
              *
            </span>
          </label>
          <div className="relative">
            <textarea
              value={formData.budgetOverview}
              onChange={(e) => handleInputChange('budgetOverview', e.target.value)}
              placeholder="Provide a brief overview of your budget submission and key objectives for the fiscal year"
              className="w-full h-[116px] bg-white border border-[#ddd] rounded-[8px] p-[18px] font-['OV_Soge'] text-[11px] text-[#afafaf] tracking-[0.55px] resize-none"
            />
            {/* Pen Icon */}
            <div className="absolute right-[18px] bottom-[18px]">
              <div className="rotate-[-43.45deg]">
                <div className="h-[1px] w-[26px] bg-black"></div>
              </div>
              <div className="absolute top-[7px] left-[9px] rotate-[-38.16deg]">
                <div className="h-[1px] w-[18px] bg-black"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-[40px] flex justify-end gap-[16px]">
          {/* Save Draft Button */}
          <button
            onClick={handleSaveDraft}
            className="h-[50px] px-[28px] bg-white border-2 border-[#173660] rounded-[8px] flex items-center gap-[10px] hover:bg-gray-50 transition-colors"
          >
            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
              <path d={svgPaths.p1f7ced80} fill="#173660" />
            </svg>
            <span className="font-['OV_Soge'] font-bold text-[14px] text-[#0b2a4a] tracking-[1.68px]">
              Save Draft
            </span>
          </button>

          {/* Preview Button */}
          <button
            onClick={handlePreview}
            className="h-[50px] px-[28px] bg-[#2FC4B2] rounded-[8px] flex items-center gap-[10px] hover:bg-[#26a999] transition-colors"
          >
            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
              <path d={svgPaths.p39ff1180} fill="#173660" />
            </svg>
            <span className="font-['OV_Soge'] font-bold text-[14px] text-[#0b2a4a] tracking-[1.68px]">
              Preview
            </span>
          </button>

          {/* Next Button */}
          <button
            onClick={handleNext}
            className="h-[50px] px-[28px] bg-[#0b2a4a] rounded-[8px] flex items-center gap-[10px] hover:bg-[#152f4d] transition-colors"
          >
            <span className="font-['OV_Soge'] font-bold text-[14px] text-white tracking-[1.68px]">
              Next
            </span>
            <svg className="size-[20px]" fill="none" viewBox="0 0 20 20">
              <path d={svgPaths.p2ffd3c00} fill="white" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
