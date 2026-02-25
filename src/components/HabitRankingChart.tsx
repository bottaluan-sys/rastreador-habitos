import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import type { HabitRankingItem } from '../hooks/useStats'

interface HabitRankingChartProps {
  data: HabitRankingItem[]
  compact?: boolean
}

export function HabitRankingChart({ data, compact }: HabitRankingChartProps) {
  const chartData = data.map((d) => ({
    name: d.habitName.length > 12 ? d.habitName.slice(0, 12) + '…' : d.habitName,
    fullName: d.habitName,
    percent: Math.round(d.percent),
    color: d.color,
  }))

  return (
    <section
      style={{
        background: compact ? 'transparent' : 'var(--bg-card)',
        borderRadius: '12px',
        padding: compact ? 0 : '16px',
        margin: compact ? 0 : '12px 16px',
        border: compact ? 'none' : '1px solid var(--border-subtle)',
      }}
    >
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '16px',
          color: 'var(--text-primary)',
        }}
      >
        Ranking de Hábitos
      </h2>
      <div style={{ height: Math.max(180, data.length * 36) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
          >
            <XAxis
              type="number"
              domain={[0, 100]}
              stroke="var(--text-secondary)"
              fontSize={11}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="var(--text-secondary)"
              fontSize={11}
              width={80}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
              }}
              formatter={(value: number, _: unknown, props: { payload?: { fullName: string } }) => [
                `${value}%`,
                props.payload?.fullName ?? '',
              ]}
            />
            <Bar dataKey="percent" radius={[0, 4, 4, 0]} maxBarSize={24}>
              {chartData.map((entry, index) => (
                <Cell key={index} fill={entry.color || 'var(--accent-red)'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
