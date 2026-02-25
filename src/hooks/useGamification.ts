import { useMemo } from 'react'
import type { Habit, Completion } from '../types'
import { getWeeksRange, getDaysInWeek, formatDate } from '../utils/dateUtils'

export interface Badge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

export interface GamificationData {
  xp: number
  level: number
  xpForNextLevel: number
  xpInCurrentLevel: number
  xpProgress: number
  badges: Badge[]
  areaStreak: number
  todayCompleted: number
  todayTotal: number
  weekPercent: number
  bestDayName: string
  dailyData: { date: string; percent: number }[]
}

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000]

function getLevel(xp: number): { level: number; xpForNext: number; xpInCurrent: number; progress: number } {
  let level = 1
  for (let i = 1; i < LEVEL_THRESHOLDS.length; i++) {
    if (xp >= LEVEL_THRESHOLDS[i]) level = i + 1
    else break
  }
  const currentThreshold = LEVEL_THRESHOLDS[level - 1] ?? 0
  const nextThreshold = LEVEL_THRESHOLDS[level] ?? currentThreshold + 2000
  const xpInCurrent = xp - currentThreshold
  const xpForNext = nextThreshold - currentThreshold
  const progress = xpForNext > 0 ? (xpInCurrent / xpForNext) * 100 : 100
  return { level, xpForNext, xpInCurrent, progress }
}

export function useGamification(
  habits: Habit[],
  completions: Completion[],
  areaId: string
): GamificationData {
  return useMemo(() => {
    const areaHabits = habits.filter((h) => h.areaId === areaId)
    const areaHabitIds = new Set(areaHabits.map((h) => h.id))
    const areaCompletions = completions.filter(
      (c) => c.completed && areaHabitIds.has(c.habitId)
    )

    const completedSet = new Set<string>()
    areaCompletions.forEach((c) => completedSet.add(`${c.habitId}-${c.date}`))

    const weeks = getWeeksRange(4)
    const allDays = weeks.flatMap((w) => getDaysInWeek(w.start))
    const todayStr = formatDate(new Date())

    // --- XP ---
    let xp = areaCompletions.length * 10

    // Streak bonus
    const sortedDates = [...new Set(allDays.map(formatDate))].sort()
    let streak = 0
    let maxStreak = 0
    let currentStreak = 0

    for (const dateStr of sortedDates) {
      if (areaHabits.length === 0) break
      const dayCompleted = areaHabits.filter((h) =>
        completedSet.has(`${h.id}-${dateStr}`)
      ).length
      const dayPercent = (dayCompleted / areaHabits.length) * 100
      if (dayPercent >= 80) {
        streak++
        maxStreak = Math.max(maxStreak, streak)
      } else {
        streak = 0
      }
    }

    // Current streak (from today backwards)
    const todayIndex = sortedDates.indexOf(todayStr)
    if (todayIndex >= 0) {
      const todayCompleted = areaHabits.filter((h) =>
        completedSet.has(`${h.id}-${todayStr}`)
      ).length
      const todayPercent = areaHabits.length > 0
        ? (todayCompleted / areaHabits.length) * 100
        : 0
      if (todayPercent >= 80) {
        currentStreak = 1
        for (let i = todayIndex - 1; i >= 0; i--) {
          const dc = areaHabits.filter((h) =>
            completedSet.has(`${h.id}-${sortedDates[i]}`)
          ).length
          const dp = areaHabits.length > 0 ? (dc / areaHabits.length) * 100 : 0
          if (dp >= 80) currentStreak++
          else break
        }
      }
    }

    xp += maxStreak * 5

    // Perfect week bonus
    weeks.forEach((w) => {
      const days = getDaysInWeek(w.start)
      const totalPossible = areaHabits.length * days.length
      if (totalPossible === 0) return
      let completed = 0
      days.forEach((day) => {
        const dateStr = formatDate(day)
        areaHabits.forEach((h) => {
          if (completedSet.has(`${h.id}-${dateStr}`)) completed++
        })
      })
      if (completed === totalPossible) xp += 50
    })

    const { level, xpForNext, xpInCurrent, progress } = getLevel(xp)

    // --- Today ---
    const todayCompletedCount = areaHabits.filter((h) =>
      completedSet.has(`${h.id}-${todayStr}`)
    ).length

    // --- Current week percent ---
    const currentWeek = weeks[weeks.length - 1]
    const currentWeekDays = currentWeek ? getDaysInWeek(currentWeek.start) : []
    const weekTotal = areaHabits.length * currentWeekDays.length
    let weekCompleted = 0
    currentWeekDays.forEach((day) => {
      const dateStr = formatDate(day)
      areaHabits.forEach((h) => {
        if (completedSet.has(`${h.id}-${dateStr}`)) weekCompleted++
      })
    })
    const weekPercent = weekTotal > 0 ? (weekCompleted / weekTotal) * 100 : 0

    // --- Best day ---
    const dayMap = new Map<number, { completed: number; total: number }>()
    for (let d = 0; d < 7; d++) dayMap.set(d, { completed: 0, total: 0 })
    weeks.forEach((w) => {
      getDaysInWeek(w.start).forEach((day) => {
        const dayNum = day.getDay()
        const dateStr = formatDate(day)
        const entry = dayMap.get(dayNum)!
        entry.total += areaHabits.length
        areaHabits.forEach((h) => {
          if (completedSet.has(`${h.id}-${dateStr}`)) entry.completed++
        })
      })
    })
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
    let bestDay = 'Seg'
    let bestPercent = 0
    dayNames.forEach((name, i) => {
      const entry = dayMap.get(i)!
      const p = entry.total > 0 ? (entry.completed / entry.total) * 100 : 0
      if (p > bestPercent) {
        bestPercent = p
        bestDay = name
      }
    })

    // --- Daily data (last 7 days) ---
    const last7Days = allDays.slice(-7)
    const dailyData = last7Days.map((day) => {
      const dateStr = formatDate(day)
      const total = areaHabits.length
      if (total === 0) return { date: dateStr, percent: 0 }
      const completed = areaHabits.filter((h) =>
        completedSet.has(`${h.id}-${dateStr}`)
      ).length
      return { date: dateStr, percent: Math.round((completed / total) * 100) }
    })

    // --- Badges ---
    const badges: Badge[] = [
      {
        id: 'first-check',
        name: 'Primeiro Passo',
        description: 'Complete seu primeiro hábito',
        icon: '🎯',
        unlocked: areaCompletions.length >= 1,
      },
      {
        id: 'streak-3',
        name: 'Streak de Fogo',
        description: '3+ dias seguidos com 80%+',
        icon: '🔥',
        unlocked: maxStreak >= 3,
      },
      {
        id: 'streak-7',
        name: 'Primeira Semana',
        description: '7 dias seguidos com 80%+',
        icon: '⭐',
        unlocked: maxStreak >= 7,
      },
      {
        id: 'consistent',
        name: 'Consistente',
        description: '80%+ na semana atual',
        icon: '💪',
        unlocked: weekPercent >= 80,
      },
      {
        id: 'perfect-week',
        name: 'Semana Perfeita',
        description: '100% em uma semana',
        icon: '👑',
        unlocked: weeks.some((w) => {
          const days = getDaysInWeek(w.start)
          const total = areaHabits.length * days.length
          if (total === 0) return false
          let c = 0
          days.forEach((day) => {
            areaHabits.forEach((h) => {
              if (completedSet.has(`${h.id}-${formatDate(day)}`)) c++
            })
          })
          return c === total
        }),
      },
      {
        id: 'level-3',
        name: 'Dedicado',
        description: 'Alcance o nível 3',
        icon: '🏆',
        unlocked: level >= 3,
      },
      {
        id: 'level-5',
        name: 'Mestre',
        description: 'Alcance o nível 5',
        icon: '🧙',
        unlocked: level >= 5,
      },
      {
        id: 'streak-14',
        name: 'Imparável',
        description: '14 dias seguidos com 80%+',
        icon: '⚡',
        unlocked: maxStreak >= 14,
      },
    ]

    return {
      xp,
      level,
      xpForNextLevel: xpForNext,
      xpInCurrentLevel: xpInCurrent,
      xpProgress: progress,
      badges,
      areaStreak: currentStreak,
      todayCompleted: todayCompletedCount,
      todayTotal: areaHabits.length,
      weekPercent,
      bestDayName: bestDay,
      dailyData,
    }
  }, [habits, completions, areaId])
}
