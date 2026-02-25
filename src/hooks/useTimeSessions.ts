import { useState, useEffect, useCallback } from 'react'
import type { TimeSession } from '../types'
import { getAllTimeSessions, addTimeSession as dbAddTimeSession } from '../db'

export function useTimeSessions() {
  const [sessions, setSessions] = useState<TimeSession[]>([])

  const loadSessions = useCallback(async () => {
    const data = await getAllTimeSessions()
    setSessions(data)
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const getSessionsForHabitAndDate = useCallback(
    (habitId: string, date: string): TimeSession[] => {
      return sessions
        .filter((s) => s.habitId === habitId && s.date === date)
        .sort((a, b) => b.startTime.localeCompare(a.startTime))
    },
    [sessions]
  )

  const getTotalSecondsForHabitAndDate = useCallback(
    (habitId: string, date: string): number => {
      return getSessionsForHabitAndDate(habitId, date).reduce(
        (acc, s) => acc + s.durationSeconds,
        0
      )
    },
    [getSessionsForHabitAndDate]
  )

  const addSession = useCallback(
    async (
      habitId: string,
      date: string,
      startTime: string,
      endTime: string,
      goalMinutes: number
    ) => {
      const durationSeconds = Math.round(
        (new Date(endTime).getTime() - new Date(startTime).getTime()) / 1000
      )
      const id = `${habitId}-${date}-${startTime}`
      const session: TimeSession = {
        id,
        habitId,
        date,
        startTime,
        endTime,
        durationSeconds,
        goalMinutes,
      }
      await dbAddTimeSession(session)
      setSessions((prev) => [...prev, session])
      return session
    },
    []
  )

  return {
    sessions,
    getSessionsForHabitAndDate,
    getTotalSecondsForHabitAndDate,
    addSession,
    refresh: loadSessions,
  }
}
