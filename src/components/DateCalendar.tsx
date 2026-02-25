import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { formatDate, formatDateDisplay } from '../utils/dateUtils'

const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]
const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export type DateSelectionMode = 'single' | 'range'

export interface DateRange {
  start: Date
  end: Date
}

interface DateCalendarProps {
  selectedDate: Date
  onSelectDate: (date: Date) => void
  dateRange?: DateRange | null
  onSelectRange?: (range: DateRange | null) => void
  mode?: DateSelectionMode
}

function getDaysInMonth(year: number, month: number): (Date | null)[] {
  const first = new Date(year, month, 1)
  const last = new Date(year, month + 1, 0)
  const startDay = first.getDay()
  const days: (Date | null)[] = []
  for (let i = 0; i < startDay; i++) days.push(null)
  for (let d = 1; d <= last.getDate(); d++) {
    days.push(new Date(year, month, d))
  }
  return days
}

function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const d = formatDate(date)
  const s = formatDate(start)
  const e = formatDate(end)
  return d >= s && d <= e
}

export function DateCalendar({
  selectedDate,
  onSelectDate,
  dateRange = null,
  onSelectRange,
  mode: modeProp = 'single',
}: DateCalendarProps) {
  const [expanded, setExpanded] = useState(false)
  const [mode, setMode] = useState<DateSelectionMode>(modeProp)
  const [viewDate, setViewDate] = useState(() => new Date(selectedDate))
  const [rangeStart, setRangeStart] = useState<Date | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setViewDate((prev) => {
      const s = selectedDate
      if (prev.getFullYear() !== s.getFullYear() || prev.getMonth() !== s.getMonth()) {
        return new Date(s)
      }
      return prev
    })
  }, [selectedDate])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setExpanded(false)
      }
    }
    if (expanded) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [expanded])

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const days = getDaysInMonth(year, month)
  const selectedStr = formatDate(selectedDate)
  const todayStr = formatDate(new Date())

  const prevMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1))
  }
  const nextMonth = () => {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1))
  }
  const goToToday = () => {
    const today = new Date()
    setViewDate(today)
    onSelectDate(today)
    if (mode === 'range') {
      setRangeStart(null)
      onSelectRange?.(null)
    }
  }

  const handleDayClick = (day: Date) => {
    if (mode === 'single') {
      onSelectDate(day)
      setExpanded(false)
      return
    }
    if (mode === 'range') {
      if (!rangeStart) {
        setRangeStart(day)
        onSelectDate(day)
        onSelectRange?.({ start: day, end: day })
      } else {
        const [start, end] = day < rangeStart ? [day, rangeStart] : [rangeStart, day]
        onSelectDate(start)
        onSelectRange?.({ start, end })
        setRangeStart(null)
        setExpanded(false)
      }
    }
  }

  const clearRange = () => {
    setRangeStart(null)
    onSelectRange?.(null)
    onSelectDate(new Date())
  }

  const displayLabel =
    mode === 'range' && dateRange && dateRange.start.getTime() !== dateRange.end.getTime()
      ? `${formatDateDisplay(dateRange.start)} – ${formatDateDisplay(dateRange.end)}`
      : formatDateDisplay(selectedDate)

  return (
    <div ref={containerRef} style={{ position: 'relative', margin: '12px 16px' }}>
      {/* Trigger: ícone + label */}
      <button
        onClick={() => setExpanded(!expanded)}
        aria-expanded={expanded}
        aria-label="Abrir calendário"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '10px 14px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          color: 'var(--text-primary)',
          cursor: 'pointer',
          fontSize: 14,
          fontWeight: 500,
          boxShadow: 'var(--shadow-card)',
          transition: 'background var(--transition-fast), border-color var(--transition-fast)',
        }}
      >
        <CalendarIcon size={20} color="var(--accent-red)" />
        <span style={{ flex: 1, textAlign: 'left' }}>{displayLabel}</span>
        <ChevronDown
          size={18}
          color="var(--text-secondary)"
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform var(--transition-fast)',
          }}
        />
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.section
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: 8,
              zIndex: 100,
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: 12,
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-elevated)',
              maxWidth: 320,
            }}
          >
            {/* Modo: data única ou intervalo */}
            <div
              style={{
                display: 'flex',
                gap: 8,
                marginBottom: 12,
              }}
            >
              <button
                onClick={() => {
                  setMode('single')
                  setRangeStart(null)
                  onSelectRange?.(null)
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 500,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  background: mode === 'single' ? 'var(--accent-red)' : 'var(--bg-secondary)',
                  color: mode === 'single' ? 'white' : 'var(--text-secondary)',
                }}
              >
                Data única
              </button>
              <button
                onClick={() => {
                  setMode('range')
                  setRangeStart(null)
                  onSelectRange?.(null)
                }}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  fontSize: 12,
                  fontWeight: 500,
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  cursor: 'pointer',
                  background: mode === 'range' ? 'var(--accent-red)' : 'var(--bg-secondary)',
                  color: mode === 'range' ? 'white' : 'var(--text-secondary)',
                }}
              >
                Intervalo
              </button>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 8,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <CalendarIcon size={18} color="var(--text-secondary)" />
                <span style={{ fontSize: 14, fontWeight: 600 }}>
                  {MONTH_NAMES[month]} {year}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <button
                  onClick={prevMonth}
                  aria-label="Mês anterior"
                  style={{
                    padding: 4,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={nextMonth}
                  aria-label="Próximo mês"
                  style={{
                    padding: 4,
                    background: 'transparent',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 2,
                marginBottom: 6,
              }}
            >
              {DAY_NAMES.map((name) => (
                <div
                  key={name}
                  style={{
                    fontSize: 10,
                    color: 'var(--text-secondary)',
                    textAlign: 'center',
                    fontWeight: 500,
                  }}
                >
                  {name}
                </div>
              ))}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                gap: 2,
              }}
            >
              {days.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} />
                const dateStr = formatDate(day)
                const isSelected = dateStr === selectedStr
                const isToday = dateStr === todayStr
                const isRangeStart =
                  mode === 'range' &&
                  dateRange &&
                  formatDate(dateRange.start) === dateStr
                const isRangeEnd =
                  mode === 'range' &&
                  dateRange &&
                  formatDate(dateRange.end) === dateStr
                const isInRange =
                  mode === 'range' &&
                  dateRange &&
                  isDateInRange(day, dateRange.start, dateRange.end)

                return (
                  <button
                    key={dateStr}
                    onClick={() => handleDayClick(day)}
                    style={{
                      aspectRatio: '1',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 12,
                      fontWeight: isToday ? 600 : 400,
                      background: isRangeStart || isRangeEnd
                        ? 'var(--accent-red)'
                        : isInRange
                          ? 'var(--accent-red-soft)'
                          : isSelected
                            ? 'var(--accent-red)'
                            : 'transparent',
                      color:
                        isRangeStart || isRangeEnd || isSelected
                          ? 'white'
                          : 'var(--text-primary)',
                      border: isToday && !isSelected && !isInRange ? '2px solid var(--accent-red)' : 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      transition: 'background var(--transition-fast)',
                    }}
                  >
                    {day.getDate()}
                  </button>
                )
              })}
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button
                onClick={goToToday}
                style={{
                  flex: 1,
                  padding: 6,
                  fontSize: 12,
                  color: 'var(--accent-red)',
                  background: 'transparent',
                  border: '1px solid var(--accent-red)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                }}
              >
                Ir para hoje
              </button>
              {mode === 'range' && (dateRange || rangeStart) && (
                <button
                  onClick={clearRange}
                  style={{
                    padding: 6,
                    fontSize: 12,
                    color: 'var(--text-secondary)',
                    background: 'var(--bg-secondary)',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                  }}
                >
                  Limpar
                </button>
              )}
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </div>
  )
}
