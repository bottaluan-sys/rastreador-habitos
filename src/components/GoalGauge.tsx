import { RadialBarChart, RadialBar, ResponsiveContainer, Legend } from 'recharts'

interface GoalGaugeProps {
  currentPercent: number
  goalPercent: number
  onGoalChange?: (percent: number) => void
}

const STORAGE_KEY = 'rastreador-daily-goal'

export function getStoredGoal(): number {
  const v = localStorage.getItem(STORAGE_KEY)
  const n = v ? parseInt(v, 10) : 80
  return Number.isNaN(n) ? 80 : Math.min(100, Math.max(0, n))
}

export function setStoredGoal(percent: number): void {
  localStorage.setItem(STORAGE_KEY, String(Math.min(100, Math.max(0, percent))))
}

export function GoalGauge({
  currentPercent,
  goalPercent,
  onGoalChange,
}: GoalGaugeProps) {
  const data = [
    {
      name: 'Meta',
      value: Math.min(100, (currentPercent / goalPercent) * 100),
      fill: currentPercent >= goalPercent ? 'var(--accent-green)' : 'var(--accent-red)',
    },
  ]

  return (
    <section
      style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '16px',
        margin: '12px 16px',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <h2
        style={{
          fontSize: '18px',
          fontWeight: 600,
          marginBottom: '8px',
          color: 'var(--text-primary)',
        }}
      >
        Meta Diária
      </h2>
      {onGoalChange && (
        <div style={{ marginBottom: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
          Meta: {goalPercent}%{' '}
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={goalPercent}
            onChange={(e) => onGoalChange(parseInt(e.target.value, 10))}
            style={{ width: 80, verticalAlign: 'middle' }}
          />
        </div>
      )}
      <div style={{ height: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadialBarChart
            cx="50%"
            cy="50%"
            innerRadius="60%"
            outerRadius="90%"
            barSize={12}
            data={data}
            startAngle={180}
            endAngle={0}
          >
            <RadialBar background dataKey="value" cornerRadius={6} />
            <Legend
              content={() => (
                <text
                  x="50%"
                  y="50%"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fill="var(--text-primary)"
                  fontSize={24}
                  fontWeight={600}
                >
                  {Math.round(currentPercent)}%
                </text>
              )}
            />
          </RadialBarChart>
        </ResponsiveContainer>
      </div>
      <div
        style={{
          fontSize: '12px',
          color: 'var(--text-secondary)',
          textAlign: 'center',
        }}
      >
        {currentPercent >= goalPercent
          ? 'Meta atingida hoje!'
          : `Faltam ${Math.round(goalPercent - currentPercent)}% para a meta`}
      </div>
    </section>
  )
}
