import React, { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { TransactionForm } from '@/components/treasury/forms/TransactionForm';

export default function RecordTransactionPage() {
  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-[#0B2A4A] tracking-tight">Financial Operation</h1>
          <p className="text-sm text-slate-500 font-medium">
            Record and categorize treasury transactions.
          </p>
        </div>
        <Link href="/admin/treasury">
          <Button variant="outline" size="sm" className="gap-2 font-medium cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Back to Treasury
          </Button>
        </Link>
      </div>

      <Suspense fallback={<div className="p-10 text-center animate-pulse">Loading form...</div>}>
        <TransactionForm />
      </Suspense>
    </div>
  );
}
