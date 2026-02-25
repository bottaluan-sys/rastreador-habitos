import { TrendingUp } from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ChartDataPoint {
  day: string
  percent: number
  week: string
}

interface ProgressChartProps {
  data: ChartDataPoint[]
  compact?: boolean
}

export function ProgressChart({ data, compact }: ProgressChartProps) {
  return (
    <section
      style={{
        background: compact ? 'transparent' : 'var(--bg-card)',
        borderRadius: compact ? 0 : 'var(--radius-xl)',
        padding: compact ? 0 : '16px',
        margin: compact ? 0 : '12px 16px',
        border: compact ? 'none' : '1px solid var(--border-subtle)',
        boxShadow: compact ? 'none' : 'var(--shadow-card)',
      }}
    >
      <h2
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '16px',
          color: 'var(--text-primary)',
        }}
      >
        {!compact && <TrendingUp size={20} color="var(--accent-red)" />}
        Progresso Geral dos Hábitos
      </h2>
      <div style={{ height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorPercent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-red)" stopOpacity={0.9} />
                <stop offset="100%" stopColor="var(--accent-red)" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
            <XAxis
              dataKey="day"
              stroke="var(--text-secondary)"
              fontSize={11}
              tickLine={false}
              tickFormatter={(v: string) => {
                const parts = v.split('-')
                const d = parts[2]
                const m = parts[1]
                return d && m ? `${d}/${Number(m)}` : v
              }}
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
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
              }}
              labelStyle={{ color: 'var(--text-primary)' }}
              formatter={(value: number) => [`${value}%`, 'Conclusão']}
            />
            <Area
              type="monotone"
              dataKey="percent"
              stroke="var(--accent-red)"
              fillOpacity={1}
              fill="url(#colorPercent)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
