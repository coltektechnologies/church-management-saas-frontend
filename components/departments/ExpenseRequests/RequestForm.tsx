import { useState } from 'react';
import {
  Search,
  Calendar,
  Receipt,
  Building2,
  FileText,
  DollarSign,
  Wallet,
  CreditCard,
  Landmark,
  Smartphone,
  User,
  Hash,
  Phone,
  FileCheck,
  Users,
  CheckCircle,
  Upload,
  CloudUpload,
} from 'lucide-react';

type PaymentMethod = 'cash' | 'cheque' | 'bank' | 'mobile' | null;

export default function ExpenseEntryForm() {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    date: '2026/03/14',
    voucherNo: 'EXP-2024-0158',
    expenseType: '',
    department: '',
    description: '',
    amount: '',
    amountInWords: '',
    currency: 'Ghana Cedi',
    paidTo: '',
    phoneNumber: '',
    idNumber: '',
    vendorRegistration: '',
    requestedBy: 'Auto-filled from request',
    approvedBy: 'Auto-filled from request',
    recordedBy: 'Bro Owusu William',
    // Payment method specific fields
    chequeNumber: '',
    bankName: '',
    accountNumber: '',
    mobileProvider: '',
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderPaymentMethodFields = () => {
    switch (paymentMethod) {
      case 'cash':
        return (
          <>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4 text-teal-600" />
                Paid to <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.paidTo}
                onChange={(e) => handleInputChange('paidTo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Hash className="w-4 h-4 text-teal-600" />
                ID Number
              </label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </>
        );

      case 'cheque':
        return (
          <>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4 text-teal-600" />
                Paid to <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.paidTo}
                onChange={(e) => handleInputChange('paidTo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Receipt className="w-4 h-4 text-teal-600" />
                Cheque Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.chequeNumber}
                onChange={(e) => handleInputChange('chequeNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Landmark className="w-4 h-4 text-teal-600" />
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Hash className="w-4 h-4 text-teal-600" />
                ID Number
              </label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </>
        );

      case 'bank':
        return (
          <>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4 text-teal-600" />
                Paid to <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.paidTo}
                onChange={(e) => handleInputChange('paidTo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Landmark className="w-4 h-4 text-teal-600" />
                Bank Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.bankName}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Hash className="w-4 h-4 text-teal-600" />
                Account Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.accountNumber}
                onChange={(e) => handleInputChange('accountNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <FileCheck className="w-4 h-4 text-teal-600" />
                Vendor Registration
              </label>
              <input
                type="text"
                value={formData.vendorRegistration}
                onChange={(e) => handleInputChange('vendorRegistration', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </>
        );

      case 'mobile':
        return (
          <>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <User className="w-4 h-4 text-teal-600" />
                Paid to <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.paidTo}
                onChange={(e) => handleInputChange('paidTo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Phone className="w-4 h-4 text-teal-600" />
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Smartphone className="w-4 h-4 text-teal-600" />
                Mobile Money Provider <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.mobileProvider}
                onChange={(e) => handleInputChange('mobileProvider', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
              >
                <option value="">Select Provider</option>
                <option value="mtn">MTN Mobile Money</option>
                <option value="vodafone">Vodafone Cash</option>
                <option value="airteltigo">AirtelTigo Money</option>
              </select>
            </div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <Hash className="w-4 h-4 text-teal-600" />
                ID Number
              </label>
              <input
                type="text"
                value={formData.idNumber}
                onChange={(e) => handleInputChange('idNumber', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-white">
      <h1 className="text-2xl font-semibold text-gray-900 mb-6">New Expense Entry</h1>

      {/* Link to Approved Request - Optional */}
      <div className="mb-6 p-6 border-2 border-dashed border-teal-400 rounded-lg bg-teal-50">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-gray-700" />
            <span className="font-medium text-gray-900">Link to Approved Request</span>
          </div>
          <span className="px-3 py-1 bg-teal-500 text-white text-xs rounded-full">Optional</span>
        </div>
        <p className="text-sm text-gray-600 mb-3">
          Search for an approved expense request to auto-fill details
        </p>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by Request ID, Title or Department"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Date and Voucher No */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Calendar className="w-4 h-4 text-teal-600" />
            Date <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.date}
            onChange={(e) => handleInputChange('date', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Receipt className="w-4 h-4 text-teal-600" />
            Voucher No <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.voucherNo}
            onChange={(e) => handleInputChange('voucherNo', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Expense Type and Department */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <FileText className="w-4 h-4 text-teal-600" />
            Expense Type <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.expenseType}
            onChange={(e) => handleInputChange('expenseType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">Select Type</option>
            <option value="travel">Travel</option>
            <option value="supplies">Office Supplies</option>
            <option value="equipment">Equipment</option>
            <option value="utilities">Utilities</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Building2 className="w-4 h-4 text-teal-600" />
            Department <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.department}
            onChange={(e) => handleInputChange('department', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="">Select Departments</option>
            <option value="finance">Finance</option>
            <option value="hr">Human Resources</option>
            <option value="it">IT</option>
            <option value="music">Music Ministry</option>
            <option value="operations">Operations</option>
          </select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2 mb-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <FileText className="w-4 h-4 text-teal-600" />
          Description / Purpose <span className="text-red-500">*</span>
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          rows={4}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
        />
      </div>

      {/* Amount and Amount in Words */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <DollarSign className="w-4 h-4 text-teal-600" />
            Amount <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <FileText className="w-4 h-4 text-teal-600" />
            Amount in Words
          </label>
          <input
            type="text"
            placeholder="Enter amount above"
            value={formData.amountInWords}
            onChange={(e) => handleInputChange('amountInWords', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Currency and Payment Method */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Wallet className="w-4 h-4 text-teal-600" />
            Currency <span className="text-red-500">*</span>
          </label>
          <select
            value={formData.currency}
            onChange={(e) => handleInputChange('currency', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
          >
            <option value="Ghana Cedi">Ghana Cedi</option>
            <option value="USD">US Dollar</option>
            <option value="EUR">Euro</option>
            <option value="GBP">British Pound</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <CreditCard className="w-4 h-4 text-teal-600" />
            Payment Method <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => setPaymentMethod('cash')}
              className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg transition-all ${
                paymentMethod === 'cash'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-300 bg-white hover:border-teal-300'
              }`}
            >
              <Wallet
                className={`w-5 h-5 mb-1 ${paymentMethod === 'cash' ? 'text-teal-600' : 'text-gray-600'}`}
              />
              <span
                className={`text-xs ${paymentMethod === 'cash' ? 'text-teal-700 font-medium' : 'text-gray-700'}`}
              >
                Cash
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('cheque')}
              className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg transition-all ${
                paymentMethod === 'cheque'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-300 bg-white hover:border-teal-300'
              }`}
            >
              <Receipt
                className={`w-5 h-5 mb-1 ${paymentMethod === 'cheque' ? 'text-teal-600' : 'text-gray-600'}`}
              />
              <span
                className={`text-xs ${paymentMethod === 'cheque' ? 'text-teal-700 font-medium' : 'text-gray-700'}`}
              >
                Cheque
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('bank')}
              className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg transition-all ${
                paymentMethod === 'bank'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-300 bg-white hover:border-teal-300'
              }`}
            >
              <Landmark
                className={`w-5 h-5 mb-1 ${paymentMethod === 'bank' ? 'text-teal-600' : 'text-gray-600'}`}
              />
              <span
                className={`text-xs ${paymentMethod === 'bank' ? 'text-teal-700 font-medium' : 'text-gray-700'}`}
              >
                Bank
              </span>
            </button>
            <button
              type="button"
              onClick={() => setPaymentMethod('mobile')}
              className={`flex flex-col items-center justify-center p-3 border-2 rounded-lg transition-all ${
                paymentMethod === 'mobile'
                  ? 'border-teal-500 bg-teal-50'
                  : 'border-gray-300 bg-white hover:border-teal-300'
              }`}
            >
              <Smartphone
                className={`w-5 h-5 mb-1 ${paymentMethod === 'mobile' ? 'text-teal-600' : 'text-gray-600'}`}
              />
              <span
                className={`text-xs ${paymentMethod === 'mobile' ? 'text-teal-700 font-medium' : 'text-gray-700'}`}
              >
                Mobile
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Dynamic Payment Method Fields */}
      {paymentMethod && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6 p-4 bg-teal-50 rounded-lg border border-teal-200">
          {renderPaymentMethodFields()}
        </div>
      )}

      {/* Requested By, Approved By, Recorded By */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <Users className="w-4 h-4 text-teal-600" />
            Requested By
          </label>
          <input
            type="text"
            value={formData.requestedBy}
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle className="w-4 h-4 text-teal-600" />
            Approved By
          </label>
          <input
            type="text"
            value={formData.approvedBy}
            disabled
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
          />
        </div>
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <User className="w-4 h-4 text-teal-600" />
            Recorded By
          </label>
          <input
            type="text"
            value={formData.recordedBy}
            onChange={(e) => handleInputChange('recordedBy', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>

      {/* Upload Receipt/Invoice */}
      <div className="space-y-2 mb-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <Upload className="w-4 h-4 text-teal-600" />
          Upload Receipt/Invoice
        </label>
        <div className="border-2 border-dashed border-teal-300 rounded-lg p-12 text-center bg-teal-50">
          <CloudUpload className="w-12 h-12 text-teal-500 mx-auto mb-3" />
          <p className="text-gray-700 mb-1">Drag & drop files or click to browse</p>
          <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
        </div>
      </div>

      {/* Budget Impact */}
      <div className="space-y-2 mb-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <Wallet className="w-4 h-4 text-teal-600" />
          Budget Impact
        </label>
        <div className="border border-teal-300 rounded-lg p-4 bg-teal-50">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-gray-900">Music Ministry Budget:</span>
            <span className="font-semibold text-teal-600">GHS8,000</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
            <div className="bg-teal-500 h-2 rounded-full" style={{ width: '46.875%' }}></div>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-700">
              Spent: <span className="font-medium">GHS3,750</span>
            </span>
            <span className="text-gray-700">
              Remaining: <span className="font-medium">GHS4,250</span>
            </span>
            <span className="text-red-500">
              This expense: <span className="font-semibold">GHS850</span>
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
          <span>✕</span>
          Cancel
        </button>
        <button className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors flex items-center justify-center gap-2">
          <FileText className="w-4 h-4" />
          Save Draft
        </button>
        <button className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center justify-center gap-2">
          <FileCheck className="w-4 h-4" />
          Save & New
        </button>
        <button className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors flex items-center justify-center gap-2">
          <Receipt className="w-4 h-4" />
          Record & Print
        </button>
      </div>
    </div>
  );
}
