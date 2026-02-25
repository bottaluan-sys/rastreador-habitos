import { useState } from 'react'
import { ChevronUp } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

interface CollapsibleSectionProps {
  title: string
  children: React.ReactNode
  defaultOpen?: boolean
  color?: string
  icon?: LucideIcon
  compact?: boolean
}

export function CollapsibleSection({
  title,
  children,
  defaultOpen = true,
  color,
  icon: Icon,
  compact = false,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)

  const colorAlpha = (alpha: string) =>
    color
      ? color.startsWith('#')
        ? `${color}${alpha}`
        : `color-mix(in srgb, ${color} ${parseInt(alpha, 16) / 2.55}%, transparent)`
      : undefined

  return (
    <section
      style={{
        background: compact
          ? 'transparent'
          : `linear-gradient(135deg, var(--bg-card), ${colorAlpha('08') ?? 'var(--bg-card)'})`,
        borderRadius: compact ? 0 : 'var(--radius-lg)',
        margin: compact ? 0 : '12px 16px',
        border: compact ? 'none' : `1px solid ${colorAlpha('20') ?? 'var(--border-subtle)'}`,
        borderLeft: !compact && color ? `4px solid ${color}` : undefined,
        boxShadow: compact ? 'none' : 'var(--shadow-card)',
        overflow: 'hidden',
        transition: 'border-color 200ms ease',
      }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        className="collapsible-header"
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: compact ? '10px 16px' : '12px 16px',
          background: 'none',
          color: 'var(--text-primary)',
          fontSize: compact ? '15px' : '16px',
          fontWeight: 700,
          textAlign: 'left',
        }}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Icon ? (
            <Icon size={18} style={{ color: color ?? 'var(--text-secondary)' }} />
          ) : (
            color && (
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: color,
                  boxShadow: `0 0 6px ${colorAlpha('60') ?? 'transparent'}`,
                }}
              />
            )
          )}
          {title}
        </span>
        <div style={{
          width: 24,
          height: 24,
          borderRadius: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: colorAlpha('12') ?? 'var(--bg-tertiary)',
          transition: 'transform 200ms ease',
          transform: open ? 'rotate(0deg)' : 'rotate(-90deg)',
        }}>
          <ChevronUp size={14} style={{ color: color ?? 'var(--text-secondary)' }} />
        </div>
      </button>
      {open && (
        <div style={{
          padding: compact ? '0 12px 10px' : '0 12px 12px',
        }}>
          {children}
        </div>
      )}
    </section>
  )
}
