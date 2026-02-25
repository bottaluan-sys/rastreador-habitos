import { useState, useEffect, useCallback } from 'react'
import { formatDate } from '../utils/dateUtils'

type AddSessionFn = (
  habitId: string,
  date: string,
  startTime: string,
  endTime: string,
  goalMinutes: number
) => Promise<void>

export function useTimer(onAddSession: AddSessionFn) {
  const [activeHabitId, setActiveHabitId] = useState<string | null>(null)
  const [elapsedSeconds, setElapsedSeconds] = useState(0)
  const [startedAt, setStartedAt] = useState<Date | null>(null)
  const [goalMinutes, setGoalMinutes] = useState(30)

  const start = useCallback((habitId: string, goal: number) => {
    setActiveHabitId(habitId)
    setGoalMinutes(goal)
    const now = new Date()
    setStartedAt(now)
    setElapsedSeconds(0)
  }, [])

  const stop = useCallback(
    async (habitId: string) => {
      if (habitId !== activeHabitId || !startedAt) return
      const endTime = new Date()
      const date = formatDate(startedAt)
      await onAddSession(
        habitId,
        date,
        startedAt.toISOString(),
        endTime.toISOString(),
        goalMinutes
      )
      setActiveHabitId(null)
      setStartedAt(null)
      setElapsedSeconds(0)
    },
    [activeHabitId, startedAt, goalMinutes, onAddSession]
  )

  useEffect(() => {
    if (!activeHabitId || !startedAt) return
    const interval = setInterval(() => {
      setElapsedSeconds(Math.floor((Date.now() - startedAt.getTime()) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [activeHabitId, startedAt])

  return {
    activeHabitId,
    elapsedSeconds,
    goalMinutes,
    start,
    stop,
    isRunning: activeHabitId !== null,
  }
}
