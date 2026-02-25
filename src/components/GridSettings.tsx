import type { GridSettings as GridSettingsType } from './HabitGrid'
import { formatDate } from '../utils/dateUtils'

interface GridSettingsProps {
  value: GridSettingsType
  onChange: (settings: GridSettingsType) => void
}

export function GridSettings({ value, onChange }: GridSettingsProps) {
  const visibleUntilStr = value.visibleUntilDate
    ? formatDate(value.visibleUntilDate)
    : ''
  const firstRowStr =
    value.firstRowDate === 'today'
      ? 'today'
      : formatDate(value.firstRowDate)

  return (
    <section
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        margin: '12px 16px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>
        Grade de hábitos
      </h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
        Configure até qual data os dados ficam visíveis e qual data aparece como primeira coluna.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            Dados visíveis até
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="date"
              value={visibleUntilStr || ''}
              onChange={(e) => {
                const v = e.target.value
                onChange({
                  ...value,
                  visibleUntilDate: v ? new Date(v + 'T12:00:00') : null,
                })
              }}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
              }}
            />
            <button
              onClick={() =>
                onChange({ ...value, visibleUntilDate: null })
              }
              style={{
                padding: '8px 12px',
                fontSize: '13px',
                background: value.visibleUntilDate ? 'var(--bg-secondary)' : 'var(--accent-red)',
                color: value.visibleUntilDate ? 'var(--text-secondary)' : 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              Sem limite
            </button>
          </div>
        </div>

        <div>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: 'var(--text-secondary)',
              marginBottom: '6px',
            }}
          >
            Primeira coluna (data de início)
          </label>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <button
              onClick={() =>
                onChange({ ...value, firstRowDate: 'today' })
              }
              style={{
                padding: '8px 12px',
                fontSize: '13px',
                background: value.firstRowDate === 'today' ? 'var(--accent-red)' : 'var(--bg-secondary)',
                color: value.firstRowDate === 'today' ? 'white' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              Hoje
            </button>
            <input
              type="date"
              value={firstRowStr === 'today' ? formatDate(new Date()) : firstRowStr}
              onChange={(e) => {
                const v = e.target.value
                if (v) {
                  onChange({
                    ...value,
                    firstRowDate: new Date(v + 'T12:00:00'),
                  })
                }
              }}
              style={{
                padding: '8px 12px',
                fontSize: '14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--text-primary)',
              }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
