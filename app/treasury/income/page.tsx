import { ArrowDownCircle } from 'lucide-react';

export default function IncomeRecordingPage() {
  return (
    <div className="flex flex-col gap-6 p-6 md:p-8 max-w-5xl mx-auto">
      {/* Page header */}
      <div className="flex items-center gap-4">
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md flex-shrink-0"
          style={{ background: '#0B2A4A' }}
        >
          <ArrowDownCircle size={22} color="#2FC4B2" />
        </div>
        <div>
          <h1 className="text-2xl font-black text-foreground">Income Recording</h1>
          <p className="text-sm text-muted-foreground font-medium">
            Log and track all incoming funds.
          </p>
        </div>
      </div>

      {/* Placeholder content card */}
      <div className="bg-card border border-border rounded-[20px] p-10 flex flex-col items-center justify-center gap-4 text-center min-h-[320px] shadow-sm">
        <ArrowDownCircle size={48} className="text-muted-foreground/40" />
        <p className="text-base font-semibold text-muted-foreground">
          Income Recording — coming soon
        </p>
        <p className="text-xs text-muted-foreground/60 max-w-xs">
          This section is under construction. Your content will appear here.
        </p>
      </div>
    </div>
  );
}
