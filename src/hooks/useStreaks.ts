import { useMemo } from 'react'
import type { Habit } from '../types'
import type { Completion } from '../types'
import { getWeeksRange, getDaysInWeek, formatDate } from '../utils/dateUtils'

const STREAK_THRESHOLD_PERCENT = 80

export function useStreaks(
  habits: Habit[],
  completions: Completion[]
): { currentStreak: number; longestStreak: number } {
  return useMemo(() => {
    const weeks = getWeeksRange(4)
    const allDays = weeks.flatMap((w) => getDaysInWeek(w.start)).sort(
      (a, b) => a.getTime() - b.getTime()
    )

    const completedSet = new Set<string>()
    completions
      .filter((c) => c.completed)
      .forEach((c) => completedSet.add(`${c.habitId}-${c.date}`))

    const dayScores = new Map<string, number>()
    allDays.forEach((day) => {
      const dateStr = formatDate(day)
      const total = habits.length
      if (total === 0) {
        dayScores.set(dateStr, 0)
        return
      }
      const completed = habits.filter((h) =>
        completedSet.has(`${h.id}-${dateStr}`)
      ).length
      const percent = (completed / total) * 100
      dayScores.set(dateStr, percent)
    })

    const todayStr = formatDate(new Date())
    const sortedDates = [...dayScores.keys()].sort()

    let longestStreak = 0
    let currentStreak = 0

    let streak = 0
    for (const dateStr of sortedDates) {
      const percent = dayScores.get(dateStr) ?? 0
      if (percent >= STREAK_THRESHOLD_PERCENT) {
        streak++
        longestStreak = Math.max(longestStreak, streak)
      } else {
        streak = 0
      }
    }

    const todayIndex = sortedDates.indexOf(todayStr)
    if (todayIndex >= 0 && (dayScores.get(todayStr) ?? 0) >= STREAK_THRESHOLD_PERCENT) {
      currentStreak = 1
      for (let i = todayIndex - 1; i >= 0; i--) {
        const p = dayScores.get(sortedDates[i]) ?? 0
        if (p >= STREAK_THRESHOLD_PERCENT) currentStreak++
        else break
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(longestStreak, currentStreak),
    }
  }, [habits, completions])
}
