import { useMemo } from 'react'
import type { Habit } from '../types'
import type { Completion } from '../types'
import type { Area } from '../types'
import { getWeeksRange, formatDate, getDatesBetween } from '../utils/dateUtils'

export interface AreaProgress {
  areaId: string
  areaName: string
  color?: string
  percent: number
}

export interface ChartDataPoint {
  day: string
  percent: number
  week: string
}

export interface WeekProgress {
  week: number
  label: string
  percent: number
}

export interface HeatmapDataPoint {
  date: string
  percent: number
}

export interface HabitRankingItem {
  habitId: string
  habitName: string
  percent: number
  color?: string
}

export interface HabitDistributionItem {
  name: string
  value: number
  color: string
}

export interface DayOfWeekItem {
  day: string
  percent: number
  completed: number
  total: number
}

const HABIT_COLORS = [
  '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899',
]

export interface DateRange {
  start: Date
  end: Date
}

export function useStats(
  habits: Habit[],
  completions: Completion[],
  areas: Area[] = [],
  baseDate?: Date,
  dateRange?: DateRange | null
): {
  chartData: ChartDataPoint[]
  weeklyProgress: WeekProgress[]
  heatmapData: HeatmapDataPoint[]
  habitRanking: HabitRankingItem[]
  habitDistribution: HabitDistributionItem[]
  dayOfWeekData: DayOfWeekItem[]
  gain: number
  loss: number
  time: number
  areaProgress: AreaProgress[]
  getHabitProgress: (habitId: string) => number
  getHabitChartData: (habitId: string) => ChartDataPoint[]
} {
  const weeks = useMemo(() => {
    if (dateRange) {
      const days = getDatesBetween(dateRange.start, dateRange.end)
      if (days.length === 0) return []
      const result: { start: Date; end: Date }[] = []
      let i = 0
      while (i < days.length) {
        const start = days[i]
        const end = days[Math.min(i + 6, days.length - 1)]
        result.push({ start, end })
        i += 7
      }
      return result
    }
    return getWeeksRange(4, baseDate)
  }, [baseDate, dateRange])
  const completedSet = useMemo(() => {
    const set = new Set<string>()
    completions
      .filter((c) => c.completed)
      .forEach((c) => set.add(`${c.habitId}-${c.date}`))
    return set
  }, [completions])

  const getDaysForPeriod = (w: { start: Date; end: Date }) =>
    getDatesBetween(w.start, w.end)

  const chartData = useMemo(() => {
    const points: ChartDataPoint[] = []
    weeks.forEach((w, wi) => {
      getDaysForPeriod(w).forEach((day) => {
        const dateStr = formatDate(day)
        const totalPossible = habits.length
        if (totalPossible === 0) {
          points.push({ day: dateStr, percent: 0, week: `Semana ${wi + 1}` })
          return
        }
        const completed = habits.filter((h) =>
          completedSet.has(`${h.id}-${dateStr}`)
        ).length
        const percent = Math.round((completed / totalPossible) * 100)
        points.push({ day: dateStr, percent, week: `Semana ${wi + 1}` })
      })
    })
    return points
  }, [habits, weeks, completedSet])

  const weeklyProgress = useMemo(() => {
    return weeks.map((w, wi) => {
      const days = getDaysForPeriod(w)
      const totalPossible = habits.length * days.length
      if (totalPossible === 0) {
        return { week: wi + 1, label: `Semana ${wi + 1}`, percent: 0 }
      }
      let completed = 0
      days.forEach((day) => {
        const dateStr = formatDate(day)
        habits.forEach((h) => {
          if (completedSet.has(`${h.id}-${dateStr}`)) completed++
        })
      })
      const percent = (completed / totalPossible) * 100
      return { week: wi + 1, label: `Semana ${wi + 1}`, percent }
    })
  }, [habits, weeks, completedSet])

  const { gain, loss, time } = useMemo(() => {
    const totalCompleted = completions.filter((c) => c.completed).length
    const totalPossible = habits.length * 28
    const totalMissed = totalPossible > 0 ? totalPossible - totalCompleted : 0
    return {
      gain: totalCompleted,
      loss: Math.min(totalMissed, 99),
      time: Math.min(Math.floor(totalMissed * 0.5), 99),
    }
  }, [completions, habits])

  const areaProgress = useMemo(() => {
    const allDays = weeks.flatMap((w) => getDaysForPeriod(w))
    const result: AreaProgress[] = []
    for (const area of areas) {
      const areaHabits = habits.filter((h) => h.areaId === area.id)
      const totalPossible = areaHabits.length * allDays.length
      if (totalPossible === 0) {
        result.push({ areaId: area.id, areaName: area.name, color: area.color, percent: 0 })
        continue
      }
      let completed = 0
      allDays.forEach((day) => {
        const dateStr = formatDate(day)
        areaHabits.forEach((h) => {
          if (completedSet.has(`${h.id}-${dateStr}`)) completed++
        })
      })
      const percent = (completed / totalPossible) * 100
      result.push({ areaId: area.id, areaName: area.name, color: area.color, percent })
    }
    return result
  }, [habits, areas, weeks, completedSet])

  const getHabitProgress = useMemo(() => {
    return (habitId: string): number => {
      const allDays = weeks.flatMap((w) => getDaysForPeriod(w))
      const total = allDays.length
      if (total === 0) return 0
      const completed = allDays.filter(
        (day) => completedSet.has(`${habitId}-${formatDate(day)}`)
      ).length
      return (completed / total) * 100
    }
  }, [weeks, completedSet])

  const heatmapData = useMemo(() => {
    return chartData.map((p) => ({ date: p.day, percent: p.percent }))
  }, [chartData])

  const habitRanking = useMemo(() => {
    const getProgress = (habitId: string): number => {
      const allDays = weeks.flatMap((w) => getDaysForPeriod(w))
      const total = allDays.length
      if (total === 0) return 0
      const completed = allDays.filter(
        (day) => completedSet.has(`${habitId}-${formatDate(day)}`)
      ).length
      return (completed / total) * 100
    }
    return habits
      .map((h) => ({
        habitId: h.id,
        habitName: h.name,
        percent: getProgress(h.id),
        color: h.color || HABIT_COLORS[habits.indexOf(h) % HABIT_COLORS.length],
      }))
      .sort((a, b) => b.percent - a.percent)
  }, [habits, weeks, completedSet])

  const habitDistribution = useMemo(() => {
    const totalCompleted = completions.filter((c) => c.completed).length
    if (totalCompleted === 0) {
      return habits.map((h, i) => ({
        name: h.name,
        value: 0,
        color: h.color || HABIT_COLORS[i % HABIT_COLORS.length],
      }))
    }
    return habits.map((h, i) => {
      const count = completions.filter(
        (c) => c.habitId === h.id && c.completed
      ).length
      return {
        name: h.name,
        value: count,
        color: h.color || HABIT_COLORS[i % HABIT_COLORS.length],
      }
    })
  }, [habits, completions])

  const dayOfWeekData = useMemo(() => {
    const dayMap = new Map<number, { completed: number; total: number }>()
    for (let d = 0; d < 7; d++) dayMap.set(d, { completed: 0, total: 0 })

    weeks.forEach((w) => {
      getDaysForPeriod(w).forEach((day) => {
        const dayNum = day.getDay()
        const dateStr = formatDate(day)
        const entry = dayMap.get(dayNum)!
        entry.total += habits.length
        habits.forEach((h) => {
          if (completedSet.has(`${h.id}-${dateStr}`)) entry.completed++
        })
      })
    })

    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    return dayNames.map((day, i) => {
      const entry = dayMap.get(i)!
      const percent = entry.total > 0 ? (entry.completed / entry.total) * 100 : 0
      return {
        day,
        percent: Math.round(percent),
        completed: entry.completed,
        total: entry.total,
      }
    })
  }, [habits, weeks, completedSet])

  const getHabitChartData = useMemo(() => {
    return (habitId: string): ChartDataPoint[] => {
      return weeks.flatMap((w, wi) =>
        getDaysForPeriod(w).map((day) => {
          const dateStr = formatDate(day)
          const completed = completedSet.has(`${habitId}-${dateStr}`) ? 1 : 0
          const percent = completed * 100
          return {
            day: dateStr,
            percent,
            week: `Semana ${wi + 1}`,
          }
        })
      )
    }
  }, [weeks, completedSet])

  return {
    chartData,
    weeklyProgress,
    heatmapData,
    habitRanking,
    habitDistribution,
    dayOfWeekData,
    gain,
    loss,
    time,
    areaProgress,
    getHabitProgress,
    getHabitChartData,
  }
}
