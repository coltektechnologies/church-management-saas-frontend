interface SummaryCardProps {
  title: string;
  value: number;
  color: string;
}

export default function SummaryCard({ title, value, color }: SummaryCardProps) {
  return (
    <div className="bg-white p-7 rounded-2xl border border-gray-200 shadow-sm hover:shadow-lg/30 transition">
      <p className="text-sm text-gray-500">{title}</p>
      <p className={`mt-3 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
