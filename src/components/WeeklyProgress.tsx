interface WeekProgress {
  week: number
  label: string
  percent: number
}

interface WeeklyProgressProps {
  weeks: WeekProgress[]
  compact?: boolean
}

export function WeeklyProgress({ weeks, compact }: WeeklyProgressProps) {
  return (
    <section
      style={{
        background: compact ? 'transparent' : 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: compact ? 0 : '16px',
        margin: compact ? 0 : '12px 16px',
        border: compact ? 'none' : '1px solid var(--border-subtle)',
        boxShadow: compact ? 'none' : 'var(--shadow-card)',
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
        Progresso Semanal
      </h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {weeks.map((w) => (
          <div
            key={w.week}
            style={{
              flex: '1 1 120px',
              minWidth: 100,
            }}
          >
            <div
              style={{
                fontSize: '13px',
                color: 'var(--text-primary)',
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              {w.label}
            </div>
            <div
              style={{
                height: 10,
                background: 'var(--bg-tertiary)',
                borderRadius: 999,
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  height: '100%',
                  width: `${Math.min(100, Math.max(0, w.percent))}%`,
                  background: w.percent >= 100
                    ? 'linear-gradient(90deg, var(--accent-green) 0%, #34d399 100%)'
                    : 'var(--accent-red)',
                  borderRadius: 999,
                  transition: 'width var(--transition-smooth)',
                }}
              />
            </div>
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: 4, display: 'block' }}>
              {Math.round(w.percent)}%
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
