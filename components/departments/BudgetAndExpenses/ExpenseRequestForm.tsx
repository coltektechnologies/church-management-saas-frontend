'use client';

import { useState } from 'react';
import { MapPin, Home, User, Phone, TrendingUp, Send, Save } from 'lucide-react';
import ExpenseRequestFormHeader from './ExpenseRequestFormHeader';

interface FormData {
  address: string;
  firstName: string;
  serviceNumber: string;
  category: string;
  justification: string;
}

interface FormErrors {
  address?: string;
  firstName?: string;
  serviceNumber?: string;
  category?: string;
  justification?: string;
}

const categories = [
  'Transportation',
  'Office Supplies',
  'Equipment',
  'Training',
  'Utilities',
  'Maintenance',
  'Other',
];

export default function ExpenseRequestForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState<FormData>({
    address: '',
    firstName: '',
    serviceNumber: '',
    category: '',
    justification: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const validateField = (name: keyof FormData, value: string): string | undefined => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) {
          return 'First name is required';
        }
        if (value.trim().length < 2) {
          return 'First name must be at least 2 characters';
        }
        break;
      case 'serviceNumber':
        if (!value.trim()) {
          return 'Service number is required';
        }
        if (!/^\+?\d{10,15}$/.test(value.replace(/\s/g, ''))) {
          return 'Please enter a valid service number (10-15 digits)';
        }
        break;
      case 'category':
        if (!value) {
          return 'Category is required';
        }
        break;
      case 'justification':
        if (!value.trim()) {
          return 'Justification is required';
        }
        if (value.trim().length < 10) {
          return 'Justification must be at least 10 characters';
        }
        break;
    }
    return undefined;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate on change if field has been touched
    if (touched[name]) {
      const error = validateField(name as keyof FormData, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (name: keyof FormData) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    (Object.keys(formData) as Array<keyof FormData>).forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    setTouched({
      address: true,
      firstName: true,
      serviceNumber: true,
      category: true,
      justification: true,
    });

    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      // Add your submit logic here

      onClose(); // Close the form after submission
    }
  };

  const handleDraft = () => {
    console.log('Saved as draft:', formData);
    // Add your draft save logic here
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-6">
        <ExpenseRequestFormHeader />
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-4 gap-6">
              <div>
                <label className="text-xs uppercase text-gray-500 font-medium mb-2 block">
                  Request ID
                </label>
                <p className="font-semibold text-gray-900">RQ-005-26</p>
              </div>
              <div>
                <label className="text-xs uppercase text-gray-500 font-medium mb-2 block">
                  From
                </label>
                <p className="font-semibold text-teal-600">Adventist Youth</p>
              </div>
              <div>
                <label className="text-xs uppercase text-gray-500 font-medium mb-2 block">To</label>
                <p className="font-semibold text-gray-900">Treasury</p>
              </div>
              <div>
                <label className="text-xs uppercase text-gray-500 font-medium mb-2 block">
                  Date
                </label>
                <p className="font-semibold text-gray-900">22-02-2026</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-6">
                {/* Address */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                      <MapPin className="text-white" size={24} />
                    </div>
                    <label className="text-sm uppercase text-gray-500 font-medium">Address</label>
                  </div>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('address')}
                    placeholder="Type here"
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  {touched.address && errors.address && (
                    <p className="mt-2 text-sm text-red-600">{errors.address}</p>
                  )}
                </div>

                {/* Department */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-teal-500 rounded-lg flex items-center justify-center">
                      <Home className="text-white" size={24} />
                    </div>
                    <label className="text-sm uppercase text-gray-500 font-medium">
                      Department
                    </label>
                  </div>
                  <div className="px-4 py-3 bg-gray-100 rounded-lg">
                    <p className="font-semibold text-gray-900">Adventist Youth</p>
                  </div>
                </div>

                {/* Added Items Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-dashed border-teal-200">
                  <div className="flex items-center justify-between mb-6">
                    <button
                      type="button"
                      className="flex items-center gap-2 px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
                    >
                      <span className="text-xl">+</span>
                      <span className="font-medium">ADDED ITEM</span>
                    </button>
                    <span className="px-4 py-2 bg-teal-50 text-teal-600 rounded-lg font-medium">
                      0 item
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 text-lg">TOTAL REQUESTED:</span>
                    <span className="font-bold text-teal-500 text-2xl">GHS0</span>
                  </div>
                </div>

                {/* Justification */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <TrendingUp className="text-gray-400" size={20} />
                    <label className="text-sm font-medium text-gray-700">Justification</label>
                  </div>
                  <textarea
                    name="justification"
                    value={formData.justification}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('justification')}
                    placeholder="Explain the purpose and need for this expense..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  {touched.justification && errors.justification && (
                    <p className="mt-2 text-sm text-red-600">{errors.justification}</p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* First Name */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    First Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <User
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('firstName')}
                      placeholder="First Name"
                      className={`w-full pl-12 pr-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        touched.firstName && errors.firstName ? 'border-red-500' : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {touched.firstName && errors.firstName && (
                    <p className="mt-2 text-sm text-red-600">{errors.firstName}</p>
                  )}
                </div>

                {/* Service Number */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Service Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="tel"
                      name="serviceNumber"
                      value={formData.serviceNumber}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('serviceNumber')}
                      placeholder="+233596038258"
                      className={`w-full pl-12 pr-4 py-3 bg-white border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        touched.serviceNumber && errors.serviceNumber
                          ? 'border-red-500'
                          : 'border-gray-200'
                      }`}
                    />
                  </div>
                  {touched.serviceNumber && errors.serviceNumber && (
                    <p className="mt-2 text-sm text-red-600">{errors.serviceNumber}</p>
                  )}
                </div>

                {/* Category */}
                <div className="bg-gray-50 rounded-lg p-6">
                  <label className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                    <TrendingUp size={16} className="text-teal-500" />
                    CATEGORY <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('category')}
                      className={`w-full px-4 py-3 bg-white border rounded-lg appearance-none focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                        touched.category && errors.category ? 'border-red-500' : 'border-gray-200'
                      }`}
                    >
                      <option value="">Select Category</option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                      <svg
                        className="w-5 h-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  {touched.category && errors.category && (
                    <p className="mt-2 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between mt-8">
              <button
                type="button"
                onClick={handleDraft}
                className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                <Save size={20} />
                Draft
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-8 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium"
              >
                <Send size={20} />
                Submit
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
