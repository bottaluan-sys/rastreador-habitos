import { Flame } from 'lucide-react'

interface StreakCardProps {
  currentStreak: number
  longestStreak: number
}

export function StreakCard({ currentStreak, longestStreak }: StreakCardProps) {
  return (
    <section
      style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '16px',
        margin: '12px 16px',
        border: '1px solid var(--border-subtle)',
        display: 'flex',
        gap: '24px',
        flexWrap: 'wrap',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--accent-red)',
        }}
      >
        <Flame size={28} />
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Streak atual
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{currentStreak} dias</div>
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: 'var(--text-primary)',
        }}
      >
        <div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            Maior streak
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{longestStreak} dias</div>
        </div>
      </div>
    </section>
  )
}
