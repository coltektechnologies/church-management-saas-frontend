interface SummaryCardProps {
  title: string;
  value: number;
  /** Tailwind text color classes, include dark: variants e.g. text-blue-600 dark:text-blue-400 */
  color: string;
}

const panel =
  'bg-[var(--admin-surface)] p-7 rounded-2xl border border-[var(--admin-border)] shadow-sm dark:shadow-none dark:ring-1 dark:ring-white/10 hover:shadow-lg/30 transition';

export default function SummaryCard({ title, value, color }: SummaryCardProps) {
  return (
    <div className={panel}>
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className={`mt-3 text-3xl font-semibold ${color}`}>{value}</p>
    </div>
  );
}
