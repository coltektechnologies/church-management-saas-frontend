'use client';

import { useState, useRef } from 'react';
import { CloudUpload, FileText, X, Info } from 'lucide-react';
import { BudgetFormData } from '@/types/budget';
import { ApprovalChain } from '@/components/admin/budgetWizard/JustificationStep';

interface Props {
  formData: BudgetFormData;
  setFormData: React.Dispatch<React.SetStateAction<BudgetFormData>>;
}

export default function DocumentsStep({ formData, setFormData }: Props) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) {
      return;
    }
    setFormData((prev) => ({
      ...prev,
      documents: [...prev.documents, ...Array.from(incoming)],
    }));
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((_, i) => i !== index),
    }));
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Section header */}
      <div className="flex items-center gap-3 pb-2 border-b border-gray-100">
        <div className="w-7 h-7 rounded-full bg-teal-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">
          4
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Supporting Documents</h2>
          <p className="text-sm text-gray-500">
            Upload relevant documents to support your budget request
          </p>
        </div>
      </div>

      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all ${
          dragging
            ? 'border-teal-400 bg-teal-50'
            : 'border-gray-200 hover:border-teal-300 hover:bg-gray-50'
        }`}
      >
        <CloudUpload
          size={40}
          className={dragging ? 'text-teal-500' : 'text-gray-400'}
          strokeWidth={1.5}
        />
        <div className="text-center">
          <p className="text-xl font-bold text-gray-900">Upload Supporting Documents</p>
          <p className="text-sm text-gray-500 mt-1">Drag and drop files here or click to browse</p>
        </div>
        <div className="flex items-center gap-2 bg-gray-100 text-gray-500 text-sm px-4 py-2 rounded-full">
          <Info size={14} className="text-blue-500 flex-shrink-0" />
          <span>Supported formats: PDF, Excel, Word, Images (Max 10MB each)</span>
        </div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".pdf,.xlsx,.xls,.doc,.docx,.png,.jpg,.jpeg"
          className="hidden"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {/* Uploaded files */}
      {formData.documents.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">
            Uploaded Files ({formData.documents.length})
          </p>
          {formData.documents.map((file, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-4 py-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <FileText size={16} className="text-blue-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatSize(file.size)}</p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(i);
                }}
                className="text-gray-400 hover:text-red-500 transition p-1"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Approval Chain imported from JustificationStep */}
      <ApprovalChain />
    </div>
  );
}
