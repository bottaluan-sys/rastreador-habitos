import { Bell, Battery, BatteryLow, BatteryMedium, BatteryFull, Settings } from 'lucide-react'
import type { AreaProgress } from '../hooks/useStats'

interface HeaderProps {
  areaProgress: AreaProgress[]
  onSettingsClick?: () => void
}

function getProgressEmoji(percent: number): string {
  if (percent >= 80) return '😄'
  if (percent >= 60) return '🙂'
  if (percent >= 40) return '😐'
  if (percent >= 20) return '😕'
  return '😴'
}

function getBatteryIcon(percent: number) {
  if (percent >= 75) return BatteryFull
  if (percent >= 50) return Battery
  if (percent >= 25) return BatteryMedium
  return BatteryLow
}

export function Header({ areaProgress, onSettingsClick }: HeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        padding: '14px 16px',
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          flex: 1,
          minWidth: 0,
          maxHeight: 100,
          overflowY: 'auto',
        }}
      >
        {areaProgress.length === 0 ? (
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Nenhuma área com hábitos
          </span>
        ) : (
          areaProgress.map(({ areaId, areaName, color, percent }) => {
            const BatteryIcon = getBatteryIcon(percent)
            const emoji = getProgressEmoji(percent)
            const fillColor = color ?? 'var(--accent-green)'
            return (
              <div
                key={areaId}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--text-secondary)',
                    minWidth: 70,
                  }}
                >
                  {areaName}
                </span>
                <div
                  style={{
                    flex: 1,
                    height: 8,
                    background: 'var(--bg-tertiary)',
                    borderRadius: 999,
                    overflow: 'hidden',
                    minWidth: 60,
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${Math.min(100, Math.max(0, percent))}%`,
                      background: fillColor,
                      borderRadius: 999,
                      transition: 'width var(--transition-smooth)',
                    }}
                  />
                </div>
                <BatteryIcon
                  size={18}
                  color={fillColor}
                  style={{ flexShrink: 0 }}
                />
                <span style={{ fontSize: '16px', flexShrink: 0 }}>{emoji}</span>
                <span
                  style={{
                    fontSize: '11px',
                    color: 'var(--text-secondary)',
                    minWidth: 28,
                  }}
                >
                  {Math.round(percent)}%
                </span>
              </div>
            )
          })
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {onSettingsClick && (
          <button
            aria-label="Configurações"
            onClick={onSettingsClick}
            style={{
              padding: 6,
              background: 'transparent',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              transition: 'opacity var(--transition-fast), color var(--transition-fast)',
            }}
          >
            <Settings size={20} />
          </button>
        )}
        <button aria-label="Notificações" className="header-bell-btn" style={{ transition: 'opacity var(--transition-fast)' }}>
          <Bell size={20} color="var(--text-secondary)" />
        </button>
      </div>
    </header>
  )
}
