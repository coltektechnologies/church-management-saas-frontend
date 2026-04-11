import { useState } from 'react';
import { FileCheck, Search, Calendar, Eye, FileEdit, Check } from 'lucide-react';

type RequestStatus = 'approved' | 'recorded' | 'draft';

interface Request {
  id: string;
  title: string;
  department: string;
  date: string;
  amount: string;
  status: RequestStatus;
}

export default function RequestList() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'approved' | 'recorded'>('all');

  const requests: Request[] = [
    {
      id: 'REQ-2024-001',
      title: 'Sound System Repair',
      department: 'Music Ministry',
      date: '2024-08-15',
      amount: 'GHS800',
      status: 'approved',
    },
    {
      id: 'REQ-2024-002',
      title: 'Sound System Repair',
      department: 'Music Ministry',
      date: '2024-08-15',
      amount: 'GHS800',
      status: 'recorded',
    },
    {
      id: 'REQ-2024-003',
      title: 'Sound System Repair',
      department: 'Music Ministry',
      date: '2024-08-15',
      amount: 'GHS800',
      status: 'approved',
    },
    {
      id: 'REQ-2024-004',
      title: 'Office Supplies',
      department: 'Music Ministry',
      date: '2024-08-15',
      amount: 'GHS800',
      status: 'recorded',
    },
    {
      id: 'REQ-2024-005',
      title: 'Equipment Purchase',
      department: 'Music Ministry',
      date: '2024-08-15',
      amount: 'GHS800',
      status: 'draft',
    },
  ];

  const filteredRequests = requests.filter((request) => {
    if (activeFilter === 'all') {return true;}
    return request.status === activeFilter;
  });

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'approved':
        return (
          <span className="px-4 py-1 bg-teal-100 text-teal-700 text-sm rounded-full">Approved</span>
        );
      case 'recorded':
        return (
          <span className="px-4 py-1 bg-gray-300 text-gray-700 text-sm rounded-full">Recorded</span>
        );
      case 'draft':
        return (
          <span className="px-4 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
            Draft
          </span>
        );
    }
  };

  const getBorderColor = (status: RequestStatus) => {
    switch (status) {
      case 'approved':
        return 'border-l-teal-400';
      case 'recorded':
        return 'border-l-gray-400';
      case 'draft':
        return 'border-l-orange-400';
    }
  };

  const getActionButton = (status: RequestStatus) => {
    if (status === 'recorded') {
      return (
        <button className="p-3 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200 transition-colors">
          <Check className="w-5 h-5" />
        </button>
      );
    } else {
      return (
        <button className="p-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors">
          <FileEdit className="w-5 h-5" />
        </button>
      );
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FileCheck className="w-6 h-6 text-gray-900" />
        <h1 className="text-2xl font-semibold text-gray-900">Approved Requests Ready to Record</h1>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveFilter('all')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            activeFilter === 'all'
              ? 'bg-teal-500 text-white border-2 border-teal-500'
              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-teal-300'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setActiveFilter('approved')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            activeFilter === 'approved'
              ? 'bg-teal-500 text-white border-2 border-teal-500'
              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-teal-300'
          }`}
        >
          Approved
        </button>
        <button
          onClick={() => setActiveFilter('recorded')}
          className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
            activeFilter === 'recorded'
              ? 'bg-teal-500 text-white border-2 border-teal-500'
              : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-teal-300'
          }`}
        >
          Recorded
        </button>
      </div>

      {/* Request List */}
      <div className="space-y-4">
        {filteredRequests.map((request) => (
          <div
            key={request.id}
            className={`bg-white rounded-lg border-l-4 ${getBorderColor(
              request.status
            )} p-6 shadow-sm`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <div className="text-sm text-gray-600 mb-1">{request.id}</div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{request.title}</h3>
                <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    <span>{request.department}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>{request.date}</span>
                  </div>
                </div>
                <div className="text-lg font-semibold text-teal-600">{request.amount}</div>
              </div>
              <div>{getStatusBadge(request.status)}</div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button className="p-3 bg-teal-100 text-teal-600 rounded-lg hover:bg-teal-200 transition-colors">
                <Eye className="w-5 h-5" />
              </button>
              {getActionButton(request.status)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
