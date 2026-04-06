interface BudgetOverviewProps {
  totalBudget: number;
  spent: number;
  currency?: string;
}

export function BudgetOverview({ totalBudget, spent, currency = 'GHS' }: BudgetOverviewProps) {
  const remaining = totalBudget - spent;
  const progressPercentage = totalBudget > 0 ? (spent / totalBudget) * 100 : 0;

  const formatAmount = (amount: number) => {
    return `${currency}${amount.toLocaleString()}`;
  };

  return (
    <div className="relative w-full h-[100px]">
      {/* Background container */}
      <div className="absolute bg-[#ecf1fa] border-[#2fc4b2] border-l-[5px] border-solid h-[100px] left-0 rounded-[10px] top-0 w-full" />

      {/* Title */}
      <p className="absolute font-['Poppins',sans-serif] font-bold leading-[normal] left-[21px] not-italic text-[#0b2a4a] text-[14px] top-[13px] whitespace-nowrap">
        Annual Budget Overview
      </p>

      {/* Total budget (top right) */}
      <p className="absolute font-['Poppins',sans-serif] font-bold leading-[normal] right-[19px] not-italic text-[#2fc4b2] text-[14px] text-right top-[13px] whitespace-nowrap">
        {formatAmount(totalBudget)}
      </p>

      {/* Progress bar container */}
      <div className="absolute left-[21px] top-[45px] w-[calc(100%-42px)]">
        {/* Background bar */}
        <div className="absolute bg-white h-[10px] rounded-[50px] top-0 w-full" />
        {/* Progress bar */}
        <div
          className="absolute bg-[#2fc4b2] h-[10px] rounded-[50px] top-0 transition-all duration-300"
          style={{ width: `${Math.min(progressPercentage, 100)}%` }}
        />
      </div>

      {/* Spent amount (bottom left) */}
      <p className="absolute font-['Poppins',sans-serif] leading-[normal] left-[21px] not-italic text-[14px] text-black top-[66px] whitespace-nowrap">
        Spent: {formatAmount(spent)}
      </p>

      {/* Remaining amount (bottom right) */}
      <p className="absolute font-['Poppins',sans-serif] leading-[normal] right-[19px] not-italic text-[14px] text-black text-right top-[66px] whitespace-nowrap">
        Remaining: {formatAmount(remaining)}
      </p>
    </div>
  );
}
