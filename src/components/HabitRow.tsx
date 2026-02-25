import { useState, useRef, useEffect } from 'react'
import { Check, Pencil } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Habit, Area } from '../types'
import { formatDate } from '../utils/dateUtils'

interface HabitRowProps {
  habit: Habit
  areaName?: string
  areaId?: string | null
  color?: string
  areas: Area[]
  weekDays: Date[]
  todayStr?: string
  isCompleted: (habitId: string, date: string) => boolean
  onToggle: (habitId: string, date: string) => void
  onUpdateHabit?: (habit: Habit) => Promise<void>
  progressPercent: number
  isLast?: boolean
}

const DEFAULT_ACCENT = 'var(--accent-red)'

export function HabitRow({
  habit,
  areaName,
  areaId,
  color,
  areas,
  weekDays,
  todayStr,
  isCompleted,
  onToggle,
  onUpdateHabit,
  progressPercent,
  isLast,
}: HabitRowProps) {
  const [showAreaPicker, setShowAreaPicker] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const accentColor = habit.color ?? color ?? DEFAULT_ACCENT
  const canEditTag = onUpdateHabit && areas.length > 0

  const areaColorAlpha = (alpha: string) =>
    accentColor
      ? accentColor.startsWith('#')
        ? `${accentColor}${alpha}`
        : `color-mix(in srgb, ${accentColor} ${parseInt(alpha, 16) / 2.55}%, transparent)`
      : undefined

  useEffect(() => {
    if (!showAreaPicker) return
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setShowAreaPicker(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showAreaPicker])

  const handleSelectArea = async (newAreaId: string | null) => {
    if (!onUpdateHabit) return
    await onUpdateHabit({ ...habit, areaId: newAreaId ?? undefined })
    setShowAreaPicker(false)
  }

  const roundedProgress = Math.round(progressPercent)

  return (
    <tr
      className="habit-row"
      style={{
        borderBottom: isLast ? 'none' : `1px solid ${areaColorAlpha('0C') ?? 'var(--border-subtle)'}`,
      }}
    >
      {/* Sticky habit info column */}
      <td
        className="habit-grid-sticky-col"
        style={{
          padding: '10px 12px',
          verticalAlign: 'middle',
          minWidth: 130,
          background: `linear-gradient(135deg, ${areaColorAlpha('14') ?? 'var(--bg-card)'}, ${areaColorAlpha('08') ?? 'var(--bg-card)'})`,
          borderRight: `2px solid ${areaColorAlpha('50') ?? 'var(--border-subtle)'}`,
          position: 'sticky',
          left: 0,
          zIndex: 2,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 3,
              height: 28,
              background: `linear-gradient(180deg, ${accentColor}, ${areaColorAlpha('60') ?? accentColor})`,
              borderRadius: 4,
              flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
              <span style={{
                fontSize: '13px',
                fontWeight: 600,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}>
                {habit.name}
              </span>
            </div>
            {areaName && (
              <div ref={pickerRef} style={{ position: 'relative' }}>
                <button
                  type="button"
                  onClick={() => canEditTag && setShowAreaPicker((v) => !v)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 3,
                    fontSize: '9px',
                    padding: '1px 6px',
                    borderRadius: 4,
                    background: areaColorAlpha('20'),
                    color: accentColor,
                    fontWeight: 600,
                    border: 'none',
                    cursor: canEditTag ? 'pointer' : 'default',
                    letterSpacing: '0.02em',
                    textTransform: 'uppercase',
                  }}
                  title={canEditTag ? 'Clique para editar a área' : undefined}
                >
                  {areaName}
                  {canEditTag && <Pencil size={8} />}
                </button>
                {showAreaPicker && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      marginTop: 4,
                      background: 'var(--bg-card)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 8,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
                      padding: 4,
                      minWidth: 140,
                      zIndex: 50,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => handleSelectArea(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        width: '100%',
                        padding: '8px 12px',
                        background: areaId === null ? 'var(--bg-secondary)' : 'transparent',
                        border: 'none',
                        borderRadius: 6,
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        cursor: 'pointer',
                        textAlign: 'left',
                      }}
                    >
                      Sem área
                    </button>
                    {areas.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => handleSelectArea(a.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          width: '100%',
                          padding: '8px 12px',
                          background: areaId === a.id ? 'var(--bg-secondary)' : 'transparent',
                          border: 'none',
                          borderRadius: 6,
                          color: 'var(--text-primary)',
                          fontSize: 13,
                          cursor: 'pointer',
                          textAlign: 'left',
                        }}
                      >
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            background: a.color ?? 'var(--text-secondary)',
                            flexShrink: 0,
                          }}
                        />
                        {a.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            {/* Progress bar inline */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
              <div
                style={{
                  height: 3,
                  flex: 1,
                  maxWidth: 50,
                  background: areaColorAlpha('18') ?? 'var(--bg-secondary)',
                  borderRadius: 999,
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, Math.max(0, progressPercent))}%`,
                    background: accentColor,
                    borderRadius: 999,
                    transition: 'width var(--transition-smooth)',
                  }}
                />
              </div>
              <span style={{
                fontSize: '9px',
                fontWeight: 600,
                color: roundedProgress >= 80
                  ? accentColor
                  : 'var(--text-secondary)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {roundedProgress}%
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* Day cells */}
      {weekDays.map((day, dayIndex) => {
        const dateStr = formatDate(day)
        const completed = isCompleted(habit.id, dateStr)
        const isToday = todayStr !== undefined && dateStr === todayStr
        const isWeekStart = dayIndex > 0 && day.getDay() === 1
        const isFuture = todayStr !== undefined && dateStr > todayStr

        return (
          <td
            key={dateStr}
            style={{
              padding: '4px 2px',
              textAlign: 'center',
              verticalAlign: 'middle',
              background: isToday
                ? `linear-gradient(180deg, ${areaColorAlpha('10') ?? 'rgba(255,255,255,0.03)'}, transparent)`
                : undefined,
              borderLeft: isWeekStart
                ? `1px solid ${areaColorAlpha('18') ?? 'var(--border-subtle)'}`
                : undefined,
              opacity: isFuture ? 0.4 : 1,
            }}
          >
            <motion.button
              onClick={() => onToggle(habit.id, dateStr)}
              whileTap={{ scale: 0.85 }}
              aria-label={completed ? 'Desmarcar' : 'Marcar'}
              className="habit-check-btn"
              data-completed={completed}
              style={{
                width: 26,
                height: 26,
                borderRadius: '50%',
                border: completed
                  ? 'none'
                  : isToday
                    ? `2px solid ${areaColorAlpha('60') ?? 'var(--border-subtle)'}`
                    : '2px solid var(--border-subtle)',
                background: completed
                  ? accentColor
                  : 'transparent',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 150ms ease',
                boxShadow: completed
                  ? `0 0 8px ${areaColorAlpha('40') ?? 'transparent'}`
                  : 'none',
              }}
            >
              {completed && <Check size={13} color="white" strokeWidth={3} />}
            </motion.button>
          </td>
        )
      })}
    </tr>
  )
}
