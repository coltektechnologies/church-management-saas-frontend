'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from 'recharts';

const titheData = [
  { name: 'W1', value: 40 },
  { name: 'W2', value: 65 },
  { name: 'W3', value: 55 },
  { name: 'W4', value: 80 },
];

const offeringData = [
  { name: 'W1', value: 30 },
  { name: 'W2', value: 45 },
  { name: 'W3', value: 50 },
  { name: 'W4', value: 60 },
];

const TITHE_COLOR = '#14b8a6';
const OFFERING_COLOR = '#1e3a5f';

export default function TithingOfferingsChart() {
  return (
    <div
      className="p-6 flex flex-col"
      style={{
        width: 389,
        height: 281,
        borderRadius: 8,
        border: '1px solid #2FC4B2',
        background: '#FFFFFF',
      }}
    >
      <h3 className="text-lg font-bold text-gray-900 mb-2">This Month</h3>
      <div className="grid grid-cols-2 gap-4 flex-1 min-h-0 items-start">
        <div className="flex flex-col h-full">
          <div className="flex items-baseline gap-2 mb-4 flex-wrap">
            <span className="text-sm text-gray-500">Tithing</span>
            <span className="text-2xl font-bold text-gray-900">250,025,222</span>
          </div>
          <div className="h-[140px] flex-1 min-h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={titheData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis type="number" hide domain={[0, 100]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={15}>
                  {titheData.map((_, i) => (
                    <Cell key={i} fill={TITHE_COLOR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="flex flex-col h-full">
          <div className="flex items-baseline gap-2 mb-4 flex-wrap">
            <span className="text-sm text-gray-500">Offerings</span>
            <span className="text-2xl font-bold text-gray-900">250,025</span>
          </div>
          <div className="h-[140px] flex-1 min-h-[140px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={offeringData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6b7280' }}
                />
                <YAxis type="number" hide domain={[0, 100]} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={15}>
                  {offeringData.map((_, i) => (
                    <Cell key={i} fill={OFFERING_COLOR} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
