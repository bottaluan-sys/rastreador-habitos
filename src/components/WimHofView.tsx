import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Wind,
  Play,
  RotateCcw,
  Info,
  ChevronRight,
  TrendingUp,
  Flame,
  Target,
  Award,
  Timer,
  Clock,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useWimHofStats } from '../hooks/useWimHofStats'

const BREATHS_PER_ROUND = 30
const RECOVERY_HOLD_SECONDS = 15
const MAX_ROUNDS = 4
const BREATH_CYCLE_MS = 2500

type Phase = 'idle' | 'breathing' | 'retention' | 'recovery'

export function WimHofView() {
  const stats = useWimHofStats()
  const [phase, setPhase] = useState<Phase>('idle')
  const [round, setRound] = useState(1)
  const [breathCount, setBreathCount] = useState(0)
  const [retentionSeconds, setRetentionSeconds] = useState(0)
  const [recoverySeconds, setRecoverySeconds] = useState(RECOVERY_HOLD_SECONDS)
  const [isInhaling, setIsInhaling] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [showStats, setShowStats] = useState(true)
  const [retentionTimesByRound, setRetentionTimesByRound] = useState<number[]>([])
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const breathIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const clearAllIntervals = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (breathIntervalRef.current) {
      clearInterval(breathIntervalRef.current)
      breathIntervalRef.current = null
    }
  }, [])

  const startSession = useCallback(() => {
    setPhase('breathing')
    setRound(1)
    setBreathCount(0)
    setRetentionSeconds(0)
    setRecoverySeconds(RECOVERY_HOLD_SECONDS)
    setIsInhaling(true)
    setRetentionTimesByRound([])
  }, [])

  const nextRound = useCallback(
    (currentRound: number) => {
      if (currentRound >= MAX_ROUNDS) {
        stats.addSession(MAX_ROUNDS, retentionTimesByRoundRef.current)
        setPhase('idle')
        setRound(1)
        setRetentionTimesByRound([])
        clearAllIntervals()
        return
      }
      setRound((r) => r + 1)
      setBreathCount(0)
      setRetentionSeconds(0)
      setRecoverySeconds(RECOVERY_HOLD_SECONDS)
      setPhase('breathing')
      setIsInhaling(true)
    },
    [stats, clearAllIntervals]
  )

  const roundRef = useRef(round)
  roundRef.current = round

  const retentionTimesByRoundRef = useRef<number[]>([])
  retentionTimesByRoundRef.current = retentionTimesByRound

  useEffect(() => {
    if (phase !== 'breathing') return

    const halfCycle = BREATH_CYCLE_MS / 2
    let tick = 0

    const breathTick = () => {
      tick++
      const isExhaleTick = tick % 2 === 0
      setIsInhaling(!isExhaleTick)

      if (isExhaleTick) {
        setBreathCount((prev) => {
          const next = prev + 1
          if (next >= BREATHS_PER_ROUND) {
            if (breathIntervalRef.current) {
              clearInterval(breathIntervalRef.current)
              breathIntervalRef.current = null
            }
            setPhase('retention')
            setRetentionSeconds(0)
            return BREATHS_PER_ROUND
          }
          return next
        })
      }
    }

    setIsInhaling(true)
    breathIntervalRef.current = setInterval(breathTick, halfCycle)

    return () => {
      if (breathIntervalRef.current) {
        clearInterval(breathIntervalRef.current)
      }
    }
  }, [phase, round])

  useEffect(() => {
    if (phase !== 'retention') return
    intervalRef.current = setInterval(() => {
      setRetentionSeconds((s) => s + 1)
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [phase])

  useEffect(() => {
    if (phase !== 'recovery') return
    setRecoverySeconds(RECOVERY_HOLD_SECONDS)
    intervalRef.current = setInterval(() => {
      setRecoverySeconds((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          nextRound(roundRef.current)
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [phase, nextRound])

  const handleRetentionComplete = useCallback(() => {
    setRetentionTimesByRound((prev) => [...prev, retentionSeconds])
    setPhase('recovery')
    setRecoverySeconds(RECOVERY_HOLD_SECONDS)
  }, [retentionSeconds])

  const handleReset = useCallback(() => {
    const roundsCompleted = phase === 'recovery' ? round : round > 1 ? round - 1 : 0
    if (roundsCompleted > 0) {
      stats.addSession(roundsCompleted, retentionTimesByRoundRef.current)
    }
    clearAllIntervals()
    setPhase('idle')
    setRound(1)
    setBreathCount(0)
    setRetentionSeconds(0)
    setRecoverySeconds(RECOVERY_HOLD_SECONDS)
    setRetentionTimesByRound([])
  }, [clearAllIntervals, phase, round, stats])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  const formatChartDate = (dateStr: string) => {
    const parts = dateStr.split('-')
    return parts[2] && parts[1] ? `${parts[2]}/${Number(parts[1])}` : dateStr
  }

  const formatRetentionTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return m > 0 ? `${m}min ${s}s` : `${s}s`
  }

  const gradient =
    phase === 'breathing'
      ? 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'
      : phase === 'retention'
        ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
        : phase === 'recovery'
          ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)'
          : 'linear-gradient(135deg, #0ea5e9 0%, #0284c7 100%)'

  return (
    <section className="wimhof-section">
      <header className="wimhof-header">
        <div className="wimhof-header-title">
          <div className="wimhof-header-icon">
            <Wind size={22} strokeWidth={2} />
          </div>
          <h2>Método Wim Hof</h2>
        </div>
        <div className="wimhof-header-actions">
          {stats.totalSessions > 0 && (
            <div className="wimhof-header-xp">
              <span className="wimhof-level-badge">Nv. {stats.level}</span>
            </div>
          )}
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="wimhof-info-btn"
            aria-label="Informações"
          >
            <Info size={20} />
          </button>
        </div>
      </header>

      <AnimatePresence>
        {showInfo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="wimhof-info-panel"
          >
            <p>
              <strong>1. Respiração:</strong> 30 respirações profundas — inspire pelo nariz/boca
              enchendo o abdômen, expire relaxado.
            </p>
            <p>
              <strong>2. Retenção:</strong> Após a última expiração, segure o ar até sentir vontade de
              respirar.
            </p>
            <p>
              <strong>3. Recuperação:</strong> Inspire profundamente e segure por 15 segundos.
            </p>
            <p>Repita 3-4 rodadas. Pratique sentado ou deitado, nunca ao dirigir.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="wimhof-hero">
        <div
          className="wimhof-circle"
          style={{
            ['--wimhof-gradient' as string]: gradient,
            ['--wimhof-scale' as string]: phase === 'breathing' ? (isInhaling ? 1.15 : 0.85) : 1,
          }}
        >
          <div className="wimhof-circle-inner">
            <AnimatePresence mode="wait">
              {phase === 'idle' && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="wimhof-display"
                >
                  <span className="wimhof-big-text">Pronto</span>
                  <span className="wimhof-sub">Toque para começar</span>
                </motion.div>
              )}
              {phase === 'breathing' && (
                <motion.div
                  key="breathing"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="wimhof-display"
                >
                  <span className="wimhof-big-text">{breathCount}/{BREATHS_PER_ROUND}</span>
                  <span className="wimhof-sub">{isInhaling ? 'Inspire' : 'Expire'}</span>
                </motion.div>
              )}
              {phase === 'retention' && (
                <motion.div
                  key="retention"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="wimhof-display"
                >
                  <span className="wimhof-big-text">{formatTime(retentionSeconds)}</span>
                  <span className="wimhof-sub">Segure o ar</span>
                </motion.div>
              )}
              {phase === 'recovery' && (
                <motion.div
                  key="recovery"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="wimhof-display"
                >
                  <span className="wimhof-big-text">{recoverySeconds}s</span>
                  <span className="wimhof-sub">Segure inspirado</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="wimhof-round-badge">
          Rodada {round}/{MAX_ROUNDS}
        </div>

        <div className="wimhof-controls">
          {phase === 'idle' && (
            <button
              type="button"
              className="wimhof-btn-primary"
              onClick={startSession}
              style={{ background: gradient }}
            >
              <Play size={22} />
              Iniciar
            </button>
          )}

          {phase === 'retention' && (
            <button
              type="button"
              className="wimhof-btn-primary"
              onClick={handleRetentionComplete}
              style={{ background: gradient }}
            >
              Inalar e segurar
            </button>
          )}

          {(phase === 'breathing' || phase === 'recovery') && (
            <button
              type="button"
              className="wimhof-btn-secondary"
              onClick={handleReset}
            >
              <RotateCcw size={18} />
              Parar
            </button>
          )}
        </div>

        {phase === 'recovery' && round < MAX_ROUNDS && (
          <p className="wimhof-next-hint">
            Próxima rodada em {recoverySeconds}s
          </p>
        )}
        {phase === 'recovery' && round === MAX_ROUNDS && (
          <p className="wimhof-complete">Sessão concluída! +60 XP</p>
        )}
      </div>

      {/* Card de recorde - sempre visível */}
      <div className="wimhof-record-card">
        <Timer size={24} className="wimhof-record-icon" />
        <div>
          <span className="wimhof-record-label">Recorde sem respirar</span>
          <span className="wimhof-record-value">
            {stats.bestRetentionRecord > 0
              ? formatRetentionTime(stats.bestRetentionRecord)
              : '—'}
          </span>
        </div>
      </div>

      {/* Stats & Gamification */}
      <div className="wimhof-stats-toggle">
        <button
          type="button"
          onClick={() => setShowStats(!showStats)}
          className="wimhof-stats-toggle-btn"
        >
          <TrendingUp size={18} />
          <span>Progresso e Conquistas</span>
          <ChevronRight
            size={18}
            className={`wimhof-stats-chevron ${showStats ? 'open' : ''}`}
          />
        </button>
        {showStats && (
          <div className="wimhof-stats-panel">
              {/* Stats cards */}
              <div className="wimhof-stats-cards">
                <div className="wimhof-stat-card">
                  <Target size={20} className="wimhof-stat-icon" />
                  <span className="wimhof-stat-value">{stats.totalSessions}</span>
                  <span className="wimhof-stat-label">Sessões</span>
                </div>
                <div className="wimhof-stat-card">
                  <Wind size={20} className="wimhof-stat-icon" />
                  <span className="wimhof-stat-value">{stats.totalRounds}</span>
                  <span className="wimhof-stat-label">Rodadas</span>
                </div>
                <div className="wimhof-stat-card">
                  <span className="wimhof-stat-value">{stats.totalBreaths.toLocaleString('pt-BR')}</span>
                  <span className="wimhof-stat-label">Respirações</span>
                </div>
                <div className="wimhof-stat-card wimhof-stat-streak">
                  <Flame size={20} className="wimhof-stat-icon" />
                  <span className="wimhof-stat-value">{stats.currentStreak}</span>
                  <span className="wimhof-stat-label">Série atual</span>
                </div>
              </div>

              {/* XP Bar */}
              {stats.totalSessions > 0 && (
                <div className="wimhof-xp-bar">
                  <div className="wimhof-xp-header">
                    <span>Nível {stats.level}</span>
                    <span>{stats.xp} XP</span>
                  </div>
                  <div className="wimhof-xp-track">
                    <motion.div
                      className="wimhof-xp-fill"
                      initial={false}
                      animate={{ width: `${stats.xpProgress}%` }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                </div>
              )}

              {/* Gráfico de progresso: melhor tempo por série */}
              <div className="wimhof-chart">
                <h3>
                  <Clock size={18} />
                  Melhor tempo por sessão
                </h3>
                {stats.retentionProgressData.length > 0 ? (
                  <div style={{ height: 180 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={stats.retentionProgressData}
                        margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                        <XAxis
                          dataKey="sessionNum"
                          stroke="var(--text-secondary)"
                          fontSize={10}
                          tickFormatter={(v) => `Sessão ${v}`}
                        />
                        <YAxis
                          stroke="var(--text-secondary)"
                          fontSize={10}
                          tickFormatter={(v) => `${v}s`}
                        />
                        <Tooltip
                          contentStyle={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                          }}
                          labelFormatter={(_, payload) => {
                            const p = payload[0]?.payload
                            return p ? `Sessão ${p.sessionNum} • ${formatChartDate(p.date)}` : ''
                          }}
                          formatter={(value: number) => [formatRetentionTime(value), 'Melhor retenção']}
                        />
                        <Line
                          type="monotone"
                          dataKey="bestRetention"
                          stroke="#0ea5e9"
                          strokeWidth={2}
                          dot={{ fill: '#0ea5e9', r: 4 }}
                          name="bestRetention"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="wimhof-chart-empty">
                    Complete uma sessão clicando em &quot;Inalar e segurar&quot; em cada retenção para registrar os tempos.
                  </div>
                )}
              </div>

              {/* Chart - Sessões por dia */}
              <div className="wimhof-chart">
                <h3>Sessões nos últimos 14 dias</h3>
                {stats.chartData.some((d) => d.sessions > 0) ? (
                  <div style={{ height: 160 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stats.chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                        <XAxis
                          dataKey="date"
                          stroke="var(--text-secondary)"
                          fontSize={10}
                          tickFormatter={formatChartDate}
                        />
                        <YAxis stroke="var(--text-secondary)" fontSize={10} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{
                            background: 'var(--bg-secondary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                          }}
                          labelFormatter={formatChartDate}
                          formatter={(value: number, name: string) => [
                            value,
                            name === 'sessions' ? 'Sessões' : 'Rodadas',
                          ]}
                        />
                        <Bar
                          dataKey="sessions"
                          fill="var(--accent-red)"
                          radius={[4, 4, 0, 0]}
                          name="sessions"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="wimhof-chart-empty">
                    Nenhuma sessão nos últimos 14 dias.
                  </div>
                )}
              </div>

              {/* Badges */}
              <div className="wimhof-badges">
                <h3>
                  <Award size={18} />
                  Conquistas
                </h3>
                <div className="wimhof-badges-grid">
                  {stats.badges.map((b) => (
                    <div
                      key={b.id}
                      className={`wimhof-badge ${b.unlocked ? 'unlocked' : ''}`}
                      title={b.description}
                    >
                      <span className="wimhof-badge-icon">{b.icon}</span>
                      <span className="wimhof-badge-name">{b.name}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Registro de sessões */}
              {stats.sessions.length > 0 && (
                <div className="wimhof-history">
                  <h3>Registro de sessões</h3>
                  <div className="wimhof-history-list">
                    {stats.sessions.slice(0, 10).map((s, i) => {
                      const bestRetention = s.retentionSecondsByRound?.length
                        ? Math.max(...s.retentionSecondsByRound)
                        : null
                      return (
                        <div key={s.id} className="wimhof-history-item">
                          <div className="wimhof-history-main">
                            <span className="wimhof-history-session-num">
                              Sessão {stats.sessions.length - i}
                            </span>
                            <span>{new Date(s.completedAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                          <div className="wimhof-history-details">
                            <span>
                              {s.roundsCompleted} rodadas • {s.totalBreaths} respirações
                            </span>
                            {bestRetention != null && (
                              <span className="wimhof-history-retention">
                                Melhor: {formatRetentionTime(bestRetention)}
                              </span>
                            )}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
          </div>
        )}
      </div>

      <div className="wimhof-footer">
        <p className="wimhof-disclaimer">
          Não pratique ao dirigir, em pé ou na água. Consulte um médico se tiver condições
          cardiovasculares.
        </p>
      </div>
    </section>
  )
}
