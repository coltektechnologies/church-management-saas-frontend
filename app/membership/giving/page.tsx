'use client';

import { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  HeartHandshake,
  Download,
  CreditCard,
  History,
  TrendingUp,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Banknote,
  Target,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MembershipTopbar from '@/components/membership/MembershipTopbar';

// --- MOCK DATA ---
const SUMMARIES = [
  { label: 'Tithes (YTD)', amount: 'GHS 1,850.00', icon: TrendingUp },
  { label: 'Offerings (YTD)', amount: 'GHS 620.00', icon: HeartHandshake },
  { label: 'Projects (YTD)', amount: 'GHS 350.00', icon: Target },
  { label: 'Total (YTD)', amount: 'GHS 2,820.00', icon: Banknote },
];

const GIVING_HISTORY = [
  {
    id: 'TXN-1001',
    date: 'May 02, 2026',
    type: 'Tithe',
    method: 'Mobile Money',
    amount: 'GHS 200.00',
    status: 'Completed',
  },
  {
    id: 'TXN-1002',
    date: 'Apr 25, 2026',
    type: 'Offering',
    method: 'Cash',
    amount: 'GHS 50.00',
    status: 'Completed',
  },
  {
    id: 'TXN-1003',
    date: 'Apr 18, 2026',
    type: 'Building Fund',
    method: 'Bank Transfer',
    amount: 'GHS 150.00',
    status: 'Completed',
  },
  {
    id: 'TXN-1004',
    date: 'Apr 10, 2026',
    type: 'Tithe',
    method: 'Mobile Money',
    amount: 'GHS 200.00',
    status: 'Completed',
  },
  {
    id: 'TXN-1005',
    date: 'Apr 03, 2026',
    type: 'Offering',
    method: 'Cash',
    amount: 'GHS 40.00',
    status: 'Completed',
  },
  {
    id: 'TXN-1006',
    date: 'Mar 28, 2026',
    type: 'Welfare',
    method: 'Mobile Money',
    amount: 'GHS 100.00',
    status: 'Completed',
  },
  {
    id: 'TXN-1007',
    date: 'Mar 20, 2026',
    type: 'Tithe',
    method: 'Card',
    amount: 'GHS 200.00',
    status: 'Failed',
  },
  {
    id: 'TXN-1008',
    date: 'Mar 21, 2026',
    type: 'Tithe',
    method: 'Card',
    amount: 'GHS 200.00',
    status: 'Completed',
  },
];

const PLEDGES = [
  { id: '1', title: 'New Church Building Fund', target: 5000, paid: 1500, deadline: 'Dec 2026' },
  { id: '2', title: 'Youth Bus Project', target: 1000, paid: 1000, deadline: 'Aug 2026' },
];

type FilterType = 'All' | 'Tithe' | 'Offering' | 'Other';

function getStatusBadge(status: string) {
  if (status === 'Completed') {
    return (
      <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-[11px]">
        Completed
      </Badge>
    );
  }
  if (status === 'Pending') {
    return (
      <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0.5 text-[11px]">
        Pending
      </Badge>
    );
  }
  return (
    <Badge className="bg-red-100 text-red-700 hover:bg-red-100 border-none px-2 py-0.5 text-[11px]">
      Failed
    </Badge>
  );
}

export default function MembershipGivingPage() {
  const [activeFilter, setActiveFilter] = useState<FilterType>('All');

  const filteredHistory = useMemo(() => {
    if (activeFilter === 'All') {return GIVING_HISTORY;}
    if (activeFilter === 'Tithe') {return GIVING_HISTORY.filter((h) => h.type === 'Tithe');}
    if (activeFilter === 'Offering') {return GIVING_HISTORY.filter((h) => h.type === 'Offering');}
    return GIVING_HISTORY.filter((h) => h.type !== 'Tithe' && h.type !== 'Offering');
  }, [activeFilter]);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex-1">
          <MembershipTopbar
            title="My Giving"
            subtitle="Manage your tithes, offerings, and pledges"
            icon={<HeartHandshake className="text-[#2FC4B2]" size={24} />}
          />
        </div>
        <div className="flex flex-col sm:flex-row gap-3 pt-1">
          <Button className="bg-[#2FC4B2] hover:bg-[#26A69A] text-white font-medium shadow-sm h-10 px-6 w-full sm:w-auto">
            <CreditCard className="w-4 h-4 mr-2" />
            Give Now
          </Button>
          <Button
            variant="outline"
            className="border-gray-200 text-[#0A2E46] hover:bg-gray-50 font-medium h-10 px-4 w-full sm:w-auto"
          >
            <Download className="w-4 h-4 mr-2" />
            Statement
          </Button>
        </div>
      </div>

      {/* YTD Summaries */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {SUMMARIES.map((summary, idx) => {
          const Icon = summary.icon;
          return (
            <Card
              key={idx}
              className="p-5 bg-white border border-gray-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow relative overflow-hidden rounded-xl"
            >
              <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#2FC4B2]" />
              <div className="bg-[#0A2E46]/5 p-3 rounded-full">
                <Icon className="w-5 h-5 text-[#0A2E46]" />
              </div>
              <div>
                <p className="text-[12px] font-bold text-muted-foreground uppercase tracking-wide">
                  {summary.label}
                </p>
                <p className="text-xl font-bold text-[#2FC4B2] mt-0.5">{summary.amount}</p>
              </div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left Column: Giving History */}
        <div className="lg:col-span-2 space-y-4">
          <Card className="bg-white border border-gray-100 shadow-sm rounded-xl overflow-hidden flex flex-col h-full">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#0A2E46]" />
                <h2 className="text-[16px] font-bold text-[#0A2E46]">Transaction History</h2>
              </div>

              {/* Filters */}
              <div className="flex bg-gray-100/80 p-1 rounded-lg self-start sm:self-auto">
                {(['All', 'Tithe', 'Offering', 'Other'] as FilterType[]).map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      'px-4 py-1.5 text-[13px] font-medium rounded-md transition-colors',
                      activeFilter === filter
                        ? 'bg-white text-[#0A2E46] shadow-sm'
                        : 'text-gray-500 hover:text-[#0A2E46]'
                    )}
                  >
                    {filter}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50/50 text-gray-500 text-[12px] uppercase tracking-wider border-b border-gray-100">
                    <th className="px-5 py-3 font-semibold">Date & ID</th>
                    <th className="px-5 py-3 font-semibold">Type</th>
                    <th className="px-5 py-3 font-semibold">Method</th>
                    <th className="px-5 py-3 font-semibold text-right">Amount</th>
                    <th className="px-5 py-3 font-semibold text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredHistory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-[#0A2E46] text-[14px]">{item.date}</div>
                        <div className="text-[11px] text-gray-400 mt-0.5">{item.id}</div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-medium text-gray-700 text-[13px]">{item.type}</span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="text-gray-500 text-[13px]">{item.method}</span>
                      </td>
                      <td className="px-5 py-3.5 text-right font-bold text-[#0A2E46] text-[14px]">
                        {item.amount}
                      </td>
                      <td className="px-5 py-3.5 text-center">{getStatusBadge(item.status)}</td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-gray-500 text-[14px]">
                        No transactions found for this filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            {filteredHistory.length > 0 && (
              <div className="p-4 border-t border-gray-100 text-center mt-auto">
                <Button
                  variant="ghost"
                  className="text-[13px] text-[#2FC4B2] hover:text-[#2FC4B2] hover:bg-[#2FC4B2]/10 h-8"
                >
                  Load More
                </Button>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Pledges */}
        <div className="space-y-6">
          <Card className="bg-white border border-gray-100 shadow-sm rounded-xl p-5">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-[#0A2E46]" />
                <h2 className="text-[16px] font-bold text-[#0A2E46]">My Pledges</h2>
              </div>
            </div>

            <div className="space-y-6">
              {PLEDGES.map((pledge) => {
                const percent = Math.min(100, Math.round((pledge.paid / pledge.target) * 100));
                const isCompleted = percent >= 100;
                return (
                  <div key={pledge.id} className="space-y-2.5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-[14px] text-[#0A2E46] leading-tight">
                          {pledge.title}
                        </h3>
                        <p className="text-[12px] text-gray-500 mt-1 flex items-center gap-1.5">
                          <Clock className="w-3 h-3" /> Due: {pledge.deadline}
                        </p>
                      </div>
                      {isCompleted ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none px-2 py-0.5 text-[10px] uppercase">
                          Fulfilled
                        </Badge>
                      ) : (
                        <span className="text-[13px] font-bold text-[#2FC4B2]">{percent}%</span>
                      )}
                    </div>

                    <div>
                      <Progress
                        value={percent}
                        className={cn(
                          'h-2',
                          isCompleted ? '[&>div]:bg-emerald-500' : '[&>div]:bg-[#2FC4B2]'
                        )}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[12px]">
                      <span className="text-gray-600 font-medium">
                        GHS {pledge.paid.toLocaleString()} paid
                      </span>
                      <span className="text-gray-400">of GHS {pledge.target.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <Button
                variant="outline"
                className="w-full text-[#0A2E46] border-gray-200 hover:bg-gray-50 font-medium"
              >
                Make a New Pledge
              </Button>
            </div>
          </Card>

          <Card className="border-transparent shadow-sm rounded-xl p-5 bg-gradient-to-br from-[#0A2E46] to-[#124263] text-white">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="bg-white/10 p-3 rounded-full">
                <HeartHandshake className="w-6 h-6 text-[#2FC4B2]" />
              </div>
              <h3 className="font-bold text-[16px]">Automate Your Giving</h3>
              <p className="text-[13px] text-white/80 leading-relaxed">
                Set up recurring tithes and offerings so you never miss a chance to give back.
              </p>
              <Button className="mt-2 bg-[#2FC4B2] hover:bg-[#26A69A] text-white w-full font-medium">
                Set Up Auto-Give
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
