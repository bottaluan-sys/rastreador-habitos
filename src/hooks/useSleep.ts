import { useState, useEffect, useCallback, useMemo } from 'react'
import type { SleepSession } from '../types'
import {
  getAllSleepSessions,
  addSleepSession,
  updateSleepSession,
  deleteSleepSession,
} from '../db'
import { formatDate, addDays, getDatesBetween } from '../utils/dateUtils'

const DEFAULT_TARGET_HOURS = 8

/** Calcula duração em minutos entre sleepTime e wakeTime (HH:mm). */
export function calcDurationMinutes(sleepTime: string, wakeTime: string): number {
  const [sh, sm] = sleepTime.split(':').map(Number)
  const [wh, wm] = wakeTime.split(':').map(Number)
  let sleepMins = sh * 60 + sm
  let wakeMins = wh * 60 + wm
  if (wakeMins <= sleepMins) wakeMins += 24 * 60 // atravessou meia-noite
  return wakeMins - sleepMins
}

export interface SleepStats {
  sessions: SleepSession[]
  addSession: (params: {
    date: string
    sleepTime: string
    wakeTime: string
    quality?: number
  }) => Promise<SleepSession>
  updateSession: (session: SleepSession) => Promise<void>
  removeSession: (id: string) => Promise<void>
  averageHours: number
  averageMinutes: number
  targetHours: number
  currentStreak: number
  longestStreak: number
  chartData: { date: string; hours: number; minutes: number; quality?: number }[]
  lastNightSession: SleepSession | null
}

export function useSleep(): SleepStats {
  const [sessions, setSessions] = useState<SleepSession[]>([])

  const loadSessions = useCallback(async () => {
    const s = await getAllSleepSessions()
    setSessions(s)
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const addSession = useCallback(
    async (params: {
      date: string
      sleepTime: string
      wakeTime: string
      quality?: number
    }) => {
      const durationMinutes = calcDurationMinutes(params.sleepTime, params.wakeTime)
      const session = await addSleepSession({
        date: params.date,
        sleepTime: params.sleepTime,
        wakeTime: params.wakeTime,
        durationMinutes,
        quality: params.quality,
        createdAt: Date.now(),
      })
      setSessions((prev) => [session, ...prev])
      return session
    },
    []
  )

  const updateSession = useCallback(async (session: SleepSession) => {
    const durationMinutes = calcDurationMinutes(session.sleepTime, session.wakeTime)
    const updated = { ...session, durationMinutes }
    await updateSleepSession(updated)
    setSessions((prev) => prev.map((s) => (s.id === session.id ? updated : s)))
  }, [])

  const removeSession = useCallback(async (id: string) => {
    await deleteSleepSession(id)
    setSessions((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const stats = useMemo(() => {
    const totalMinutes = sessions.reduce((sum, s) => sum + s.durationMinutes, 0)
    const averageMinutes = sessions.length > 0 ? Math.round(totalMinutes / sessions.length) : 0
    const averageHours = Math.floor(averageMinutes / 60)
    const avgMins = averageMinutes % 60

    // Streaks
    const datesSet = new Set(sessions.map((s) => s.date))
    const sortedDates = [...datesSet].sort()
    let longestStreak = 0
    let currentStreak = 0
    let streak = 1

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = new Date(sortedDates[i - 1])
      const curr = new Date(sortedDates[i])
      const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000)
      if (diffDays === 1) {
        streak++
      } else {
        longestStreak = Math.max(longestStreak, streak)
        streak = 1
      }
    }
    longestStreak = Math.max(longestStreak, streak)

    const todayStr = formatDate(new Date())
    if (datesSet.has(todayStr)) {
      currentStreak = 1
      let d = addDays(new Date(), -1)
      while (datesSet.has(formatDate(d))) {
        currentStreak++
        d = addDays(d, -1)
      }
    }

    // Chart data - últimos 14 dias
    const endDate = new Date()
    const startDate = addDays(endDate, -13)
    const chartDates = getDatesBetween(startDate, endDate)
    const chartData = chartDates.map((d) => {
      const dateStr = formatDate(d)
      const daySession = sessions.find((s) => s.date === dateStr)
      if (!daySession) {
        return {
          date: dateStr,
          hours: 0,
          minutes: 0,
          quality: undefined,
        }
      }
      return {
        date: dateStr,
        hours: Math.floor(daySession.durationMinutes / 60),
        minutes: daySession.durationMinutes % 60,
        quality: daySession.quality,
      }
    })

    const lastNightSession = sessions.find((s) => s.date === todayStr) ?? sessions[0] ?? null

    return {
      sessions,
      addSession,
      updateSession,
      removeSession,
      averageHours,
      averageMinutes: avgMins,
      targetHours: DEFAULT_TARGET_HOURS,
      currentStreak,
      longestStreak,
      chartData,
      lastNightSession,
    }
  }, [sessions, addSession, updateSession, removeSession])

  return stats
}
