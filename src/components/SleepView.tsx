import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Moon,
  Sun,
  Plus,
  Play,
  Square,
  ChevronRight,
  TrendingUp,
  Clock,
  Flame,
  Target,
  Trash2,
  Info,
  RotateCcw,
} from 'lucide-react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { useSleep, calcDurationMinutes } from '../hooks/useSleep'
import { formatDate, formatDateDisplay } from '../utils/dateUtils'

const SLEEP_GRADIENT = 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}min` : `${h}h`
}

function formatChartDate(dateStr: string): string {
  const parts = dateStr.split('-')
  return parts[2] && parts[1] ? `${parts[2]}/${Number(parts[1])}` : dateStr
}

function formatTimeHHMM(d: Date): string {
  const h = d.getHours()
  const m = d.getMinutes()
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

const TRACKING_KEY = 'sleep-tracking-start'

export function SleepView() {
  const stats = useSleep()
  const [showForm, setShowForm] = useState(false)
  const [showStats, setShowStats] = useState(true)
  const [showInfo, setShowInfo] = useState(false)
  const [date, setDate] = useState(() => formatDate(new Date()))
  const [sleepTime, setSleepTime] = useState('23:00')
  const [wakeTime, setWakeTime] = useState('07:00')
  const [quality, setQuality] = useState<number | undefined>(undefined)
  const [trackingStart, setTrackingStart] = useState<number | null>(() => {
    const stored = localStorage.getItem(TRACKING_KEY)
    return stored ? parseInt(stored, 10) : null
  })
  const [elapsedMinutes, setElapsedMinutes] = useState(0)

  useEffect(() => {
    if (!trackingStart) return
    const update = () => {
      const mins = Math.floor((Date.now() - trackingStart) / 60000)
      setElapsedMinutes(mins)
    }
    update()
    const id = setInterval(update, 60000)
    return () => clearInterval(id)
  }, [trackingStart])

  const handleStart = () => {
    const now = Date.now()
    setTrackingStart(now)
    localStorage.setItem(TRACKING_KEY, String(now))
  }

  const handleStop = async () => {
    if (!trackingStart) return
    const startDate = new Date(trackingStart)
    const endDate = new Date()
    const dateStr = formatDate(endDate)
    const sleepTimeStr = formatTimeHHMM(startDate)
    const wakeTimeStr = formatTimeHHMM(endDate)
    await stats.addSession({
      date: dateStr,
      sleepTime: sleepTimeStr,
      wakeTime: wakeTimeStr,
      quality: undefined,
    })
    setTrackingStart(null)
    localStorage.removeItem(TRACKING_KEY)
  }

  const handleCancelTracking = () => {
    setTrackingStart(null)
    localStorage.removeItem(TRACKING_KEY)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const duration = calcDurationMinutes(sleepTime, wakeTime)
    if (duration <= 0 || duration > 24 * 60) return
    await stats.addSession({ date, sleepTime, wakeTime, quality })
    setShowForm(false)
    setDate(formatDate(new Date()))
    setSleepTime('23:00')
    setWakeTime('07:00')
    setQuality(undefined)
  }

  const previewDuration = calcDurationMinutes(sleepTime, wakeTime)

  return (
    <section className="sleep-section">
      <header className="sleep-header">
        <div className="sleep-header-title">
          <div className="sleep-header-icon">
            <Moon size={22} strokeWidth={2} />
          </div>
          <h2>Controlador de Sono</h2>
        </div>
        <div className="sleep-header-actions">
          <button
            type="button"
            onClick={() => setShowInfo(!showInfo)}
            className="sleep-info-btn"
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
            className="sleep-info-panel"
          >
            <p>
              <strong>Modo rápido:</strong> Toque em Iniciar ao deitar e Parar ao acordar. O app
              registra automaticamente a duração.
            </p>
            <p>
              <strong>Modo manual:</strong> Use &quot;Registrar manualmente&quot; para informar
              a hora que dormiu e acordou.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="sleep-hero">
        <div className="sleep-circle" style={{ ['--sleep-gradient' as string]: SLEEP_GRADIENT }}>
          <div className="sleep-circle-inner">
            {trackingStart ? (
              <div className="sleep-display">
                <span className="sleep-big-text">{formatDuration(elapsedMinutes)}</span>
                <span className="sleep-sub">Dormindo</span>
                <span className="sleep-date">
                  desde {formatTimeHHMM(new Date(trackingStart))}
                </span>
              </div>
            ) : stats.lastNightSession ? (
              <div className="sleep-display">
                <span className="sleep-big-text">
                  {formatDuration(stats.lastNightSession.durationMinutes)}
                </span>
                <span className="sleep-sub">Última noite</span>
                <span className="sleep-date">
                  {formatDateDisplay(new Date(stats.lastNightSession.date))}
                </span>
              </div>
            ) : (
              <div className="sleep-display">
                <span className="sleep-big-text">—</span>
                <span className="sleep-sub">Nenhum registro</span>
                <span className="sleep-date">Toque em Iniciar ao deitar</span>
              </div>
            )}
          </div>
        </div>

        <div className="sleep-controls">
          {trackingStart ? (
            <div className="sleep-tracking-btns">
              <button
                type="button"
                className="sleep-btn-stop"
                onClick={handleStop}
                style={{ background: SLEEP_GRADIENT }}
              >
                <Square size={22} />
                Parar
              </button>
              <button
                type="button"
                className="sleep-btn-secondary"
                onClick={handleCancelTracking}
              >
                <RotateCcw size={18} />
                Cancelar
              </button>
            </div>
          ) : !showForm ? (
            <div className="sleep-main-btns">
              <button
                type="button"
                className="sleep-btn-primary"
                onClick={handleStart}
                style={{ background: SLEEP_GRADIENT }}
              >
                <Play size={22} />
                Iniciar
              </button>
              <button
                type="button"
                className="sleep-btn-secondary sleep-btn-manual"
                onClick={() => setShowForm(true)}
              >
                <Plus size={22} />
                Registrar manualmente
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="sleep-form">
              <div className="sleep-form-row">
                <label>Data (acordou)</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="sleep-input"
                />
              </div>
              <div className="sleep-form-row">
                <label><Moon size={16} /> Dormiu às</label>
                <input
                  type="time"
                  value={sleepTime}
                  onChange={(e) => setSleepTime(e.target.value)}
                  className="sleep-input"
                />
              </div>
              <div className="sleep-form-row">
                <label><Sun size={16} /> Acordou às</label>
                <input
                  type="time"
                  value={wakeTime}
                  onChange={(e) => setWakeTime(e.target.value)}
                  className="sleep-input"
                />
              </div>
              <div className="sleep-form-row">
                <label>Qualidade (1-5)</label>
                <div className="sleep-quality-btns">
                  {[1, 2, 3, 4, 5].map((q) => (
                    <button
                      key={q}
                      type="button"
                      className={`sleep-quality-btn ${quality === q ? 'active' : ''}`}
                      onClick={() => setQuality(quality === q ? undefined : q)}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
              <div className="sleep-form-preview">
                Duração: <strong>{formatDuration(previewDuration)}</strong>
              </div>
              <div className="sleep-form-actions">
                <button
                  type="button"
                  className="sleep-btn-secondary"
                  onClick={() => {
                    setShowForm(false)
                    setDate(formatDate(new Date()))
                    setSleepTime('23:00')
                    setWakeTime('07:00')
                    setQuality(undefined)
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="sleep-btn-primary"
                  style={{ background: SLEEP_GRADIENT }}
                  disabled={previewDuration <= 0 || previewDuration > 24 * 60}
                >
                  Salvar
                </button>
              </div>
            </form>
          )}
        </div>
      </div>

      <div className="sleep-stats-toggle">
        <button
          type="button"
          onClick={() => setShowStats(!showStats)}
          className="sleep-stats-toggle-btn"
        >
          <TrendingUp size={18} />
          <span>Estatísticas e Histórico</span>
          <ChevronRight size={18} className={`sleep-stats-chevron ${showStats ? 'open' : ''}`} />
        </button>
        {showStats && (
          <div className="sleep-stats-panel">
            <div className="sleep-stats-cards">
              <div className="sleep-stat-card">
                <Clock size={20} className="sleep-stat-icon" />
                <span className="sleep-stat-value">
                  {stats.averageHours}h{stats.averageMinutes > 0 ? ` ${stats.averageMinutes}m` : ''}
                </span>
                <span className="sleep-stat-label">Média</span>
              </div>
              <div className="sleep-stat-card">
                <Target size={20} className="sleep-stat-icon" />
                <span className="sleep-stat-value">{stats.targetHours}h</span>
                <span className="sleep-stat-label">Meta</span>
              </div>
              <div className="sleep-stat-card sleep-stat-streak">
                <Flame size={20} className="sleep-stat-icon" />
                <span className="sleep-stat-value">{stats.currentStreak}</span>
                <span className="sleep-stat-label">Série atual</span>
              </div>
            </div>

            <div className="sleep-chart">
              <h3>
                <Clock size={18} />
                Horas de sono (últimos 14 dias)
              </h3>
              {stats.chartData.some((d) => d.hours > 0 || d.minutes > 0) ? (
                <div style={{ height: 180 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={stats.chartData.map((d) => ({
                        ...d,
                        totalHours: d.hours + d.minutes / 60,
                      }))}
                      margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                      <XAxis
                        dataKey="date"
                        stroke="var(--text-secondary)"
                        fontSize={10}
                        tickFormatter={formatChartDate}
                      />
                      <YAxis
                        stroke="var(--text-secondary)"
                        fontSize={10}
                        tickFormatter={(v) => `${v}h`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                        }}
                        labelFormatter={formatChartDate}
                        formatter={(value: number) => [
                          `${Math.floor(value)}h ${Math.round((value % 1) * 60)}min`,
                          'Sono',
                        ]}
                      />
                      <Bar
                        dataKey="totalHours"
                        fill="url(#sleepBarGradient)"
                        radius={[4, 4, 0, 0]}
                        name="totalHours"
                      />
                      <defs>
                        <linearGradient id="sleepBarGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" />
                          <stop offset="100%" stopColor="#4f46e5" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="sleep-chart-empty">
                  Registre suas noites para ver o gráfico.
                </div>
              )}
            </div>

            {stats.sessions.length > 0 && (
              <div className="sleep-history">
                <h3>Histórico</h3>
                <div className="sleep-history-list">
                  {stats.sessions.slice(0, 10).map((s) => (
                    <div key={s.id} className="sleep-history-item">
                      <div className="sleep-history-main">
                        <span className="sleep-history-date">
                          {formatDateDisplay(new Date(s.date))}
                        </span>
                        <span className="sleep-history-duration">
                          {formatDuration(s.durationMinutes)}
                        </span>
                      </div>
                      <div className="sleep-history-details">
                        <span>
                          {s.sleepTime} → {s.wakeTime}
                        </span>
                        {s.quality != null && (
                          <span className="sleep-history-quality">
                            Qualidade: {s.quality}/5
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="sleep-delete-btn"
                        onClick={() => stats.removeSession(s.id)}
                        aria-label="Excluir"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  )
}
