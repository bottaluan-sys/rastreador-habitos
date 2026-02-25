import { useState, useEffect, useCallback, useMemo } from 'react'
import type { WimHofSession } from '../types'
import { getAllWimHofSessions, addWimHofSession } from '../db'
import { formatDate, addDays, getDatesBetween } from '../utils/dateUtils'

const XP_PER_ROUND = 15
const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 11000] as const

export interface WimHofBadge {
  id: string
  name: string
  description: string
  icon: string
  unlocked: boolean
}

export interface WimHofStats {
  sessions: WimHofSession[]
  totalSessions: number
  totalRounds: number
  totalBreaths: number
  currentStreak: number
  longestStreak: number
  xp: number
  level: number
  xpForNextLevel: number
  xpProgress: number
  badges: WimHofBadge[]
  chartData: { date: string; sessions: number; rounds: number }[]
  /** Melhor tempo de retenção (segundos) de todas as sessões */
  bestRetentionRecord: number
  /** Dados para gráfico: cada sessão com seu melhor tempo de retenção */
  retentionProgressData: { sessionNum: number; date: string; bestRetention: number }[]
  addSession: (roundsCompleted: number, retentionSecondsByRound?: number[]) => Promise<void>
}

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

export function useWimHofStats(): WimHofStats {
  const [sessions, setSessions] = useState<WimHofSession[]>([])

  const loadSessions = useCallback(async () => {
    const s = await getAllWimHofSessions()
    setSessions(s)
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const addSession = useCallback(
    async (roundsCompleted: number, retentionSecondsByRound?: number[]) => {
      const now = new Date()
      const date = formatDate(now)
      const totalBreaths = roundsCompleted * 30
      const session = await addWimHofSession({
        date,
        completedAt: now.toISOString(),
        roundsCompleted,
        totalBreaths,
        retentionSecondsByRound,
      })
      setSessions((prev) => [session, ...prev])
    },
    []
  )

  const stats = useMemo(() => {
    const totalSessions = sessions.length
    const totalRounds = sessions.reduce((sum, s) => sum + s.roundsCompleted, 0)
    const totalBreaths = sessions.reduce((sum, s) => sum + s.totalBreaths, 0)

    // XP: 15 por rodada
    const xp = totalRounds * XP_PER_ROUND
    const { level, xpForNext, progress } = getLevel(xp)

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
      const daySessions = sessions.filter((s) => s.date === dateStr)
      return {
        date: dateStr,
        sessions: daySessions.length,
        rounds: daySessions.reduce((sum, s) => sum + s.roundsCompleted, 0),
      }
    })

    // Recorde de retenção e gráfico de progresso por sessão
    const sessionsWithRetention = sessions.filter(
      (s) => s.retentionSecondsByRound && s.retentionSecondsByRound.length > 0
    )
    const bestRetentionRecord =
      sessionsWithRetention.length > 0
        ? Math.max(
            ...sessionsWithRetention.map((s) =>
              Math.max(...(s.retentionSecondsByRound ?? [0]))
            )
          )
        : 0
    const retentionProgressData = sessionsWithRetention
      .map((s, i) => ({
        sessionNum: sessionsWithRetention.length - i,
        date: s.date,
        bestRetention: Math.max(...(s.retentionSecondsByRound ?? [0])),
      }))
      .reverse()

    // Badges
    const badges: WimHofBadge[] = [
      {
        id: 'first-session',
        name: 'Primeiro Suspiro',
        description: 'Complete sua primeira sessão',
        icon: '🌬️',
        unlocked: totalSessions >= 1,
      },
      {
        id: 'first-full',
        name: '4 Rodadas',
        description: 'Complete as 4 rodadas em uma sessão',
        icon: '💪',
        unlocked: sessions.some((s) => s.roundsCompleted >= 4),
      },
      {
        id: 'sessions-10',
        name: '10 Sessões',
        description: 'Complete 10 sessões',
        icon: '🔥',
        unlocked: totalSessions >= 10,
      },
      {
        id: 'streak-3',
        name: 'Série de 3',
        description: '3 dias seguidos praticando',
        icon: '⭐',
        unlocked: longestStreak >= 3,
      },
      {
        id: 'sessions-25',
        name: '25 Sessões',
        description: 'Complete 25 sessões',
        icon: '🏆',
        unlocked: totalSessions >= 25,
      },
      {
        id: 'streak-7',
        name: 'Semana de Fogo',
        description: '7 dias seguidos praticando',
        icon: '⚡',
        unlocked: longestStreak >= 7,
      },
      {
        id: 'level-3',
        name: 'Respirante',
        description: 'Alcance o nível 3',
        icon: '🧘',
        unlocked: level >= 3,
      },
      {
        id: 'sessions-50',
        name: 'Mestre do Gelo',
        description: 'Complete 50 sessões',
        icon: '❄️',
        unlocked: totalSessions >= 50,
      },
      {
        id: 'level-5',
        name: 'Mestre Wim Hof',
        description: 'Alcance o nível 5',
        icon: '👑',
        unlocked: level >= 5,
      },
    ]

    return {
      sessions,
      totalSessions,
      totalRounds,
      totalBreaths,
      currentStreak,
      longestStreak,
      xp,
      level,
      xpForNextLevel: xpForNext,
      xpProgress: progress,
      badges,
      chartData,
      bestRetentionRecord,
      retentionProgressData,
      addSession,
    }
  }, [sessions, addSession])

  return stats
}
