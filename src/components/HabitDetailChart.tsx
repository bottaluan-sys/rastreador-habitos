import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { ChartDataPoint } from '../hooks/useStats'

interface HabitDetailChartProps {
  habitName: string
  data: ChartDataPoint[]
  compact?: boolean
}

export function HabitDetailChart({ habitName, data, compact }: HabitDetailChartProps) {
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
        Evolução: {habitName}
      </h2>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis
              dataKey="day"
              stroke="var(--text-secondary)"
              fontSize={11}
              tickLine={false}
            />
            <YAxis
              stroke="var(--text-secondary)"
              fontSize={11}
              tickLine={false}
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
            />
            <Tooltip
              contentStyle={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
              }}
              formatter={(value: number) => [
                `${value}%`,
                value >= 100 ? 'Completo' : 'Incompleto',
              ]}
            />
            <Line
              type="monotone"
              dataKey="percent"
              stroke="var(--accent-red)"
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
