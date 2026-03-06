'use client';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const data = [
  { month: 'Jan 20', tithe: 65, offering: 75 },
  { month: 'Feb 20', tithe: 75, offering: 70 },
  { month: 'Mar 20', tithe: 60, offering: 80 },
  { month: 'Apr 20', tithe: 80, offering: 85 },
  { month: 'May 20', tithe: 70, offering: 72 },
  { month: 'Jun 20', tithe: 85, offering: 78 },
  { month: 'Jul 20', tithe: 72, offering: 88 },
  { month: 'Aug 20', tithe: 78, offering: 82 },
  { month: 'Sep 20', tithe: 90, offering: 90 },
];

export default function MonthlyTrendChart() {
  return (
    <div
      className="flex flex-col"
      style={{
        width: 655,
        height: 281,
        borderRadius: 8,
        border: '1px solid #2FC4B2',
        background: '#FFFFFF',
        paddingLeft: 18,
        paddingRight: 23,
        paddingBottom: 6,
        paddingTop: 6,
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ paddingTop: 6, paddingBottom: 2 }}
      >
        <h3 className="text-base font-bold text-gray-900">Monthly trend of tithes vs offerings</h3>
        <select className="text-sm font-medium text-gray-700 border border-gray-300 rounded-none px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none">
          <option>This Month</option>
        </select>
      </div>
      <div
        style={{
          width: 656,
          height: 0,
          borderTop: '1px solid #2FC4B2',
          marginLeft: -18,
          marginRight: -23,
          marginBottom: 16,
        }}
      />
      <div className="flex-1 min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: '#6b7280' }}
              axisLine={{ stroke: '#e5e7eb' }}
              tickFormatter={(v) => String(v)}
            />
            <Tooltip />
            <Legend wrapperStyle={{ paddingTop: 48 }} />
            <Line
              type="monotone"
              dataKey="tithe"
              name="Tithe"
              stroke="#14b8a6"
              strokeWidth={2}
              dot={{ fill: '#14b8a6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="offering"
              name="Offering"
              stroke="#1e3a5f"
              strokeWidth={2}
              dot={{ fill: '#1e3a5f', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
