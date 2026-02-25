import type { HeatmapDataPoint } from '../hooks/useStats'

interface CalendarHeatmapProps {
  data: HeatmapDataPoint[]
  compact?: boolean
}

function getHeatmapColor(percent: number): string {
  if (percent === 0) return 'var(--bg-secondary)'
  if (percent < 25) return 'rgba(230, 57, 70, 0.25)'
  if (percent < 50) return 'rgba(230, 57, 70, 0.5)'
  if (percent < 75) return 'rgba(230, 57, 70, 0.75)'
  return 'var(--accent-red)'
}

export function CalendarHeatmap({ data, compact }: CalendarHeatmapProps) {
  const formatLabel = (d: string) => {
    const [, m, day] = d.split('-')
    return `${day}/${m} - ${d}`
  }

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
        Calendário de Atividade
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '4px',
          maxWidth: 320,
          margin: '0 auto',
        }}
      >
        {data.map(({ date, percent }) => (
          <div
            key={date}
            title={`${formatLabel(date)}: ${percent}%`}
            style={{
              aspectRatio: '1',
              borderRadius: '4px',
              background: getHeatmapColor(percent),
              minWidth: 24,
              minHeight: 24,
            }}
          />
        ))}
      </div>
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginTop: '12px',
          fontSize: '11px',
          color: 'var(--text-secondary)',
        }}
      >
        <span>Menos</span>
        <div style={{ display: 'flex', gap: 2 }}>
          {[0, 25, 50, 75, 100].map((p) => (
            <div
              key={p}
              style={{
                width: 12,
                height: 12,
                borderRadius: 2,
                background: getHeatmapColor(p),
              }}
            />
          ))}
        </div>
        <span>Mais</span>
      </div>
    </section>
  )
}
