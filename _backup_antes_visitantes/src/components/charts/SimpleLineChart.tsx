import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Props {
  data: any[];
  xKey: string;
  yKey: string;
  color?: string;
}

export default function SimpleLineChart({ data, xKey, yKey, color = '#2563eb' }: Props) {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <Line type="monotone" dataKey={yKey} stroke={color} strokeWidth={3} dot={{ r: 4, strokeWidth: 2 }} activeDot={{ r: 6 }} />
          <CartesianGrid stroke="#f3f4f6" strokeDasharray="5 5" vertical={false} />
          <XAxis dataKey={xKey} stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip 
            contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            labelStyle={{ fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
