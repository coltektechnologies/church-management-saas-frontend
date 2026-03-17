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

interface MonthlyTrendChartProps {
  data?: { month: string; tithe: number; offering: number }[];
  period?: string;
}

export default function MonthlyTrendChart({
  data = [],
  period = 'This Month',
}: MonthlyTrendChartProps) {
  return (
    <div
      className="flex flex-col w-full min-h-[281px]"
      style={{
        height: 281,
        borderRadius: 8,
        border: '1px solid #2FC4B2',
        background: '#FFFFFF',
        paddingLeft: 18,
        paddingRight: 23,
        paddingBottom: 4,
        paddingTop: 2,
      }}
    >
      <div
        className="flex items-center justify-between shrink-0"
        style={{ paddingTop: 0, paddingBottom: 4 }}
      >
        <h3 className="text-sm font-bold text-gray-900">Monthly trend of tithes vs offerings</h3>
        <select
          className="text-sm font-medium text-gray-700 border border-gray-300 rounded-none px-2.5 py-1.5 bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
          defaultValue={period}
        >
          <option>This Month</option>
        </select>
      </div>
      <div
        className="w-full border-t border-[#2FC4B2] shrink-0 -mx-[23px] mr-0 mb-1"
        style={{ marginLeft: -18, marginRight: -23 }}
      />
      <div className="flex-1 min-h-[248px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.length ? data : [{ month: '-', tithe: 0, offering: 0 }]}
            margin={{ top: 2, right: 5, left: 0, bottom: 2 }}
          >
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
            <Legend verticalAlign="top" align="right" wrapperStyle={{ paddingBottom: 8 }} />
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
