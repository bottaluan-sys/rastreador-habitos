import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import type { HabitDistributionItem } from '../hooks/useStats'

interface HabitDistributionChartProps {
  data: HabitDistributionItem[]
  compact?: boolean
}

export function HabitDistributionChart({ data, compact }: HabitDistributionChartProps) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const displayData = total > 0 ? data : data.map((d) => ({ ...d, value: 1 }))

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
        Distribuição por Hábito
      </h2>
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={displayData}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={75}
              paddingAngle={2}
              dataKey="value"
            >
              {displayData.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
              }}
              formatter={(value: number, name: string) => {
                const pct = total > 0 ? Math.round((value / total) * 100) : 0
                return [`${value} conclusões (${pct}%)`, name]
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '12px' }}
              formatter={(value) => (
                <span style={{ color: 'var(--text-secondary)' }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
