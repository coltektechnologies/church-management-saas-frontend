import { Contact, Download, TrendingUp } from 'lucide-react';

export default function MyContributionsTab() {
  const summaries = [
    { label: 'Tithe (YTD)', amount: 'GHS1850' },
    { label: 'Offerings (YTD)', amount: 'GHS620' },
    { label: 'Project (YTD)', amount: 'GHS350' },
    { label: 'Total (YTD)', amount: 'GHS2820' },
  ];

  const recentContributions = [
    { date: 'March 15, 2024', type: 'Tithe', amount: 'GHS2000' },
    { date: 'March 8, 2024:', type: 'Offering', amount: 'GHS500' },
    { date: 'March 1, 2024', type: 'Project - Building Fund', amount: 'GHS10000' },
  ];

  return (
    <div className="bg-white border border-gray-200 border-t-0 rounded-b-xl p-6">
      {/* Top Summaries */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        {summaries.map((summary, idx) => (
          <div key={idx} className="flex gap-4 items-center bg-white border border-transparent">
            <div className="w-1 h-12 bg-[#2FC4B2] rounded-full"></div>
            <div className="flex flex-col">
              <span className="text-[13px] font-bold text-[#0A2E46] mb-1">{summary.label}</span>
              <span className="text-[14px] font-bold text-[#2FC4B2]">{summary.amount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Contributions */}
      <div className="bg-[#F8FAFC] border border-gray-200 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
          <Contact size={20} className="text-[#0A2E46]" />
          <h3 className="text-[15px] font-bold text-[#0A2E46]">Recent Contributions</h3>
        </div>

        <div className="flex flex-col">
          {recentContributions.map((contrib, idx) => (
            <div
              key={idx}
              className={`flex justify-between items-center py-4 ${
                idx !== recentContributions.length - 1 ? 'border-b border-gray-200' : ''
              }`}
            >
              <div className="w-1/3 text-[13px] text-gray-500 font-medium">{contrib.date}</div>
              <div className="w-1/3 text-center text-[13px] text-gray-500 font-medium">
                {contrib.type}
              </div>
              <div className="w-1/3 text-right text-[13px] text-gray-500 font-medium">
                {contrib.amount}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button className="flex items-center gap-2 bg-[#2FC4B2] hover:bg-[#26A69A] text-white px-5 py-2.5 rounded-md text-[13px] font-semibold transition-colors">
          <TrendingUp size={16} />
          View Giving History
        </button>
        <button className="flex items-center gap-2 bg-[#0A2E46] hover:bg-[#072134] text-white px-5 py-2.5 rounded-md text-[13px] font-semibold transition-colors">
          <Download size={16} />
          Download Statement
        </button>
      </div>
    </div>
  );
}
