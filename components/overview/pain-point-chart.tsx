'use client'

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

interface PainPointChartProps {
  data: { pain_point: string; count: number }[]
}

export function PainPointChart({ data }: PainPointChartProps) {
  const formatted = data.slice(0, 10).map(d => ({
    name: d.pain_point.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
    count: d.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted} layout="vertical" margin={{ left: 16 }}>
        <XAxis type="number" tick={{ fill: '#475569', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10 }} width={160} axisLine={false} tickLine={false} />
        <Tooltip
          contentStyle={{ background: '#1a1f2e', border: '1px solid #2a2d3a', borderRadius: 8 }}
          labelStyle={{ color: '#e2e8f0' }}
          cursor={{ fill: '#2a2d3a' }}
        />
        <Bar dataKey="count" fill="#7c86ff" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  )
}
