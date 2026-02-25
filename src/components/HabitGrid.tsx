import { useRef, useEffect } from 'react'
import { Target } from 'lucide-react'
import type { Habit, Area } from '../types'
import { getWeeksRangeCentered, getWeeksFromAnchor, getDatesBetween, formatDate, getMonthName } from '../utils/dateUtils'
import { getAreaIcon } from '../constants/areaIcons'
import { HabitRow } from './HabitRow'
import { CollapsibleSection } from './CollapsibleSection'
import { HabitGridScroll } from './HabitGridScroll'

const DEFAULT_AREA_COLORS: Record<string, string> = {
  Corpo: '#22c55e',
  Mente: '#3b82f6',
  Espírito: '#a855f7',
  Financeiro: '#eab308',
  Organização: '#06b6d4',
}

interface DateRange {
  start: Date
  end: Date
}

export interface GridSettings {
  visibleUntilDate: Date | null
  firstRowDate: Date | 'today'
}

interface HabitGridProps {
  habits: Habit[]
  areas: Area[]
  isCompleted: (habitId: string, date: string) => boolean
  onToggle: (habitId: string, date: string) => void
  getHabitProgress: (habitId: string) => number
  onUpdateHabit?: (habit: Habit) => Promise<void>
  filterAreaId?: string | null
  baseDate?: Date
  dateRange?: DateRange | null
  gridSettings?: GridSettings
}

function groupHabitsByArea(
  habits: Habit[],
  areas: Area[],
  filterAreaId?: string | null
): { areaName: string; areaId: string | null; color?: string; habits: Habit[] }[] {
  const areaById = new Map(areas.map((a) => [a.id, a]))
  const uniqueByName = new Map<string, Area>()
  for (const a of areas) {
    if (!uniqueByName.has(a.name)) uniqueByName.set(a.name, a)
  }
  const byAreaName = new Map<string, Habit[]>()
  for (const h of habits) {
    const area = h.areaId ? areaById.get(h.areaId) : null
    const name = area?.name ?? '__sem_area__'
    if (!byAreaName.has(name)) byAreaName.set(name, [])
    byAreaName.get(name)!.push(h)
  }
  const result: { areaName: string; areaId: string | null; color?: string; habits: Habit[] }[] = []
  const areasToShow = filterAreaId
    ? areas.filter((a) => a.id === filterAreaId)
    : [...uniqueByName.values()]
  for (const a of areasToShow) {
    const list = byAreaName.get(a.name) ?? []
    if (list.length > 0 || filterAreaId) {
      const color = a.color ?? DEFAULT_AREA_COLORS[a.name]
      result.push({ areaName: a.name, areaId: a.id, color, habits: list })
    }
  }
  if (!filterAreaId) {
    const semArea = byAreaName.get('__sem_area__') ?? []
    if (semArea.length > 0) result.push({ areaName: 'Corpo', areaId: null, habits: semArea })
  }
  return result
}

const WEEKDAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function HabitGrid({
  habits,
  areas,
  isCompleted,
  onToggle,
  getHabitProgress,
  onUpdateHabit,
  filterAreaId,
  baseDate,
  dateRange,
  gridSettings,
}: HabitGridProps) {
  const today = baseDate ? new Date(baseDate) : new Date()
  const todayStr = formatDate(today)
  const firstRowDate = gridSettings?.firstRowDate === 'today' ? today : (gridSettings?.firstRowDate ?? today)
  const visibleUntil = gridSettings?.visibleUntilDate

  const weeks =
    dateRange && dateRange.start.getTime() !== dateRange.end.getTime()
      ? (() => {
          const days = getDatesBetween(dateRange.start, dateRange.end)
          const result: { start: Date; end: Date }[] = []
          for (let i = 0; i < days.length; i += 7) {
            result.push({
              start: days[i],
              end: days[Math.min(i + 6, days.length - 1)],
            })
          }
          return result
        })()
      : gridSettings
        ? getWeeksFromAnchor(firstRowDate, 5)
        : getWeeksRangeCentered(2, 2, baseDate)
  let weekDays = weeks.flatMap((w) => getDatesBetween(w.start, w.end))
  if (visibleUntil) {
    const limitStr = formatDate(visibleUntil)
    weekDays = weekDays.filter((d) => formatDate(d) <= limitStr)
  }
  const todayIndex = weekDays.findIndex((d) => formatDate(d) === todayStr)

  const scrollRef = useRef<HTMLDivElement>(null)
  const todayColRef = useRef<HTMLTableCellElement>(null)

  useEffect(() => {
    if (todayIndex < 0 || !scrollRef.current || !todayColRef.current) return
    const scrollEl = scrollRef.current
    const col = todayColRef.current
    const scrollCenter = scrollEl.clientWidth / 2
    const colCenter = col.offsetLeft + col.offsetWidth / 2
    scrollEl.scrollLeft = colCenter - scrollCenter
  }, [todayIndex, weekDays.length])

  const monthGroups = (() => {
    const groups: { month: string; colSpan: number }[] = []
    let prevMonth = -1
    for (const d of weekDays) {
      const m = d.getMonth()
      if (m !== prevMonth) {
        groups.push({ month: getMonthName(d, true), colSpan: 1 })
        prevMonth = m
      } else {
        groups[groups.length - 1].colSpan++
      }
    }
    return groups
  })()

  const weekGroups = (() => {
    const groups: { weekNum: number; colSpan: number; startIdx: number }[] = []
    let prevMonday = ''
    let dayIdx = 0
    for (const d of weekDays) {
      const dayNum = d.getDay() || 7
      const monday = new Date(d)
      monday.setDate(d.getDate() - dayNum + 1)
      const mondayStr = formatDate(monday)
      if (mondayStr !== prevMonday) {
        groups.push({ weekNum: groups.length + 1, colSpan: 1, startIdx: dayIdx })
        prevMonday = mondayStr
      } else {
        groups[groups.length - 1].colSpan++
      }
      dayIdx++
    }
    return groups
  })()

  const grouped = groupHabitsByArea(habits, areas, filterAreaId)

  if (grouped.length === 0) {
    return (
      <section
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-lg)',
          margin: '12px 16px',
          padding: '32px 24px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
          textAlign: 'center',
          color: 'var(--text-secondary)',
          fontSize: '14px',
        }}
      >
        <Target
          size={40}
          style={{ marginBottom: 12, opacity: 0.5, display: 'block', marginLeft: 'auto', marginRight: 'auto' }}
        />
        <p style={{ marginBottom: 4, color: 'var(--text-primary)', fontSize: '15px' }}>
          Nenhum hábito ainda
        </p>
        <p>Use o botão acima para adicionar seu primeiro hábito.</p>
      </section>
    )
  }

  return (
    <>
      {grouped.map(({ areaName, areaId, color, habits: areaHabits }, index) => {
        const areaColorAlpha = (alpha: string) =>
          color
            ? color.startsWith('#')
              ? `${color}${alpha}`
              : `color-mix(in srgb, ${color} ${parseInt(alpha, 16) / 2.55}%, transparent)`
            : undefined

        return (
          <CollapsibleSection
            key={areaId ?? 'none'}
            title={areaName}
            defaultOpen
            color={color}
            icon={getAreaIcon(areaName)}
          >
            <HabitGridScroll scrollRef={index === 0 ? scrollRef : undefined}>
              <table
                className="habit-grid-table"
                style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, minWidth: 500 }}
              >
                <thead>
                  {/* Row 1: Months */}
                  <tr>
                    <th
                      rowSpan={3}
                      className="habit-grid-sticky-col"
                      style={{
                        padding: '8px 12px',
                        textAlign: 'left',
                        verticalAlign: 'bottom',
                        background: color
                          ? `linear-gradient(135deg, ${areaColorAlpha('20')}, ${areaColorAlpha('10')})`
                          : 'var(--bg-card)',
                        borderRight: `2px solid ${areaColorAlpha('50') ?? 'var(--border-subtle)'}`,
                        position: 'sticky',
                        left: 0,
                        zIndex: 3,
                        minWidth: 130,
                      }}
                    />
                    {monthGroups.map((g, gi) => (
                      <th
                        key={gi}
                        colSpan={g.colSpan}
                        style={{
                          padding: '4px 0',
                          textAlign: 'center',
                          fontSize: '10px',
                          color: color ?? 'var(--text-secondary)',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          background: 'var(--bg-card)',
                          borderBottom: `1px solid ${areaColorAlpha('15') ?? 'var(--border-subtle)'}`,
                        }}
                      >
                        {g.month}
                      </th>
                    ))}
                  </tr>
                  {/* Row 2: Weeks */}
                  <tr>
                    {weekGroups.map((g, gi) => (
                      <th
                        key={gi}
                        colSpan={g.colSpan}
                        style={{
                          padding: '3px 0',
                          textAlign: 'center',
                          fontSize: '9px',
                          color: 'var(--text-secondary)',
                          fontWeight: 500,
                          letterSpacing: '0.04em',
                          background: 'var(--bg-card)',
                          borderBottom: `1px solid ${areaColorAlpha('10') ?? 'var(--border-subtle)'}`,
                          borderLeft: gi > 0 ? `1px solid ${areaColorAlpha('18') ?? 'var(--border-subtle)'}` : undefined,
                        }}
                      >
                        S{g.weekNum}
                      </th>
                    ))}
                  </tr>
                  {/* Row 3: Day numbers + weekday letter */}
                  <tr>
                    {weekDays.map((d, di) => {
                      const isToday = formatDate(d) === todayStr
                      const isSunday = d.getDay() === 0
                      const isWeekStart = di > 0 && d.getDay() === 1
                      return (
                        <th
                          key={di}
                          ref={index === 0 && di === todayIndex ? todayColRef : undefined}
                          style={{
                            padding: '2px 0 4px',
                            fontSize: '10px',
                            fontWeight: isToday ? 700 : 400,
                            color: isToday
                              ? color ?? 'var(--text-primary)'
                              : isSunday
                                ? 'var(--text-secondary)'
                                : 'var(--text-secondary)',
                            background: isToday
                              ? `linear-gradient(180deg, ${areaColorAlpha('18') ?? 'rgba(255,255,255,0.06)'}, transparent)`
                              : 'var(--bg-card)',
                            minWidth: 34,
                            borderBottom: isToday
                              ? `2px solid ${color ?? 'var(--text-primary)'}`
                              : `1px solid ${areaColorAlpha('08') ?? 'var(--border-subtle)'}`,
                            borderLeft: isWeekStart
                              ? `1px solid ${areaColorAlpha('18') ?? 'var(--border-subtle)'}`
                              : undefined,
                            lineHeight: 1.2,
                            position: 'relative',
                          }}
                        >
                          <div style={{
                            fontSize: '8px',
                            fontWeight: 500,
                            opacity: isToday ? 1 : 0.5,
                            color: isToday ? (color ?? 'var(--text-primary)') : undefined,
                            marginBottom: 1,
                          }}>
                            {WEEKDAY_NAMES[d.getDay()]}
                          </div>
                          <div style={{
                            fontSize: isToday ? '12px' : '11px',
                            fontWeight: isToday ? 800 : 400,
                          }}>
                            {d.getDate()}
                          </div>
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {areaHabits.length === 0 ? (
                    <tr>
                      <td
                        colSpan={weekDays.length + 1}
                        style={{
                          padding: '24px 16px',
                          textAlign: 'center',
                          color: 'var(--text-secondary)',
                          fontSize: '14px',
                        }}
                      >
                        Nenhum hábito nesta área ainda.
                      </td>
                    </tr>
                  ) : (
                    areaHabits.map((habit, hi) => (
                      <HabitRow
                        key={habit.id}
                        habit={habit}
                        areaName={areaName}
                        areaId={areaId}
                        color={color}
                        areas={areas}
                        weekDays={weekDays}
                        todayStr={todayStr}
                        isCompleted={isCompleted}
                        onToggle={onToggle}
                        onUpdateHabit={onUpdateHabit}
                        progressPercent={getHabitProgress(habit.id)}
                        isLast={hi === areaHabits.length - 1}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </HabitGridScroll>
          </CollapsibleSection>
        )
      })}
    </>
  )
}
