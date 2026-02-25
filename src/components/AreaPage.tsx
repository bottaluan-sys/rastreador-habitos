import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, TrendingUp, Flame, Calendar, Lock, Play, Square, Info, Pencil } from 'lucide-react'
import { AreaChart, Area as RechartsArea, ResponsiveContainer, Tooltip, XAxis } from 'recharts'
import type { Area, Habit, Completion } from '../types'
import { getAreaIcon } from '../constants/areaIcons'
import { useGamification } from '../hooks/useGamification'
import type { Badge } from '../hooks/useGamification'
import { useTimeSessions } from '../hooks/useTimeSessions'
import { useTimer } from '../hooks/useTimer'
import { formatDate } from '../utils/dateUtils'
import { HabitDetailsModal } from './HabitDetailsModal'
import { EditGoalModal } from './EditGoalModal'
import { MissingItemsSection } from './MissingItemsSection'

const AREA_GRADIENTS: Record<string, [string, string]> = {
  Corpo: ['#22c55e', '#16a34a'],
  Mente: ['#3b82f6', '#2563eb'],
  'Espírito': ['#a855f7', '#7c3aed'],
  Financeiro: ['#eab308', '#ca8a04'],
  Organização: ['#06b6d4', '#0891b2'],
}

function formatTimeDisplay(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

interface AreaPageProps {
  area: Area
  habits: Habit[]
  completions: Completion[]
  isCompleted: (habitId: string, date: string) => boolean
  onToggle: (habitId: string, date: string) => void
  getHabitProgress: (habitId: string) => number
  onUpdateHabit?: (habit: Habit) => Promise<void>
}

export function AreaPage({
  area,
  habits,
  completions,
  isCompleted,
  onToggle,
  getHabitProgress,
  onUpdateHabit,
}: AreaPageProps) {
  const areaHabits = habits.filter((h) => h.areaId === area.id)
  const gamification = useGamification(habits, completions, area.id)
  const Icon = getAreaIcon(area.name)
  const [grad1, grad2] = AREA_GRADIENTS[area.name] ?? [area.color ?? '#e63946', area.color ?? '#e63946']
  const todayStr = formatDate(new Date())

  const [xpPopup, setXpPopup] = useState<string | null>(null)
  const [detailsHabit, setDetailsHabit] = useState<Habit | null>(null)
  const [editHabit, setEditHabit] = useState<Habit | null>(null)

  const {
    getSessionsForHabitAndDate,
    getTotalSecondsForHabitAndDate,
    addSession,
  } = useTimeSessions()

  const handleAddSession = useCallback(
    async (
      habitId: string,
      date: string,
      startTime: string,
      endTime: string,
      goalMinutes: number
    ) => {
      const totalBefore = getTotalSecondsForHabitAndDate(habitId, date)
      const session = await addSession(habitId, date, startTime, endTime, goalMinutes)
      const totalAfter = totalBefore + session.durationSeconds
      const goalSeconds = goalMinutes * 60
      if (totalAfter >= goalSeconds && !isCompleted(habitId, date)) {
        await onToggle(habitId, date)
        setXpPopup(habitId)
        setTimeout(() => setXpPopup(null), 1200)
      }
    },
    [addSession, getTotalSecondsForHabitAndDate, isCompleted, onToggle]
  )

  const timer = useTimer(handleAddSession)

  const handleToggle = (habitId: string) => {
    const wasCompleted = isCompleted(habitId, todayStr)
    onToggle(habitId, todayStr)
    if (!wasCompleted) {
      setXpPopup(habitId)
      setTimeout(() => setXpPopup(null), 1200)
    }
  }

  const handlePlay = (habit: Habit) => {
    const goal = habit.goalMinutes ?? 30
    timer.start(habit.id, goal)
  }

  const handleStop = async (habitId: string) => {
    await timer.stop(habitId)
  }

  const handleSaveGoal = async (habit: Habit) => {
    if (onUpdateHabit) await onUpdateHabit(habit)
  }

  return (
    <div style={{ paddingBottom: 16 }}>
      {/* Hero Header */}
      <section
        style={{
          background: `linear-gradient(135deg, ${grad1}, ${grad2})`,
          margin: '12px 16px',
          borderRadius: 16,
          padding: '28px 24px 24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: -30,
            right: -30,
            width: 120,
            height: 120,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -20,
            left: -20,
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, position: 'relative' }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon size={30} color="white" />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: 'white', margin: 0 }}>{area.name}</h1>
            <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.8)' }}>
              Level {gamification.level}
            </span>
          </div>
        </div>

        {/* XP Bar */}
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
              XP: {gamification.xpInCurrentLevel} / {gamification.xpForNextLevel}
            </span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
              Level {gamification.level + 1}
            </span>
          </div>
          <div
            style={{
              height: 10,
              background: 'rgba(0,0,0,0.25)',
              borderRadius: 5,
              overflow: 'hidden',
            }}
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(gamification.xpProgress, 100)}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              style={{
                height: '100%',
                background: 'rgba(255,255,255,0.9)',
                borderRadius: 5,
              }}
            />
          </div>
          <div style={{ textAlign: 'center', marginTop: 8 }}>
            <span style={{ fontSize: 20, fontWeight: 700, color: 'white' }}>
              {gamification.xp} XP
            </span>
          </div>
        </div>

        {/* Quick Stats */}
        <div
          style={{
            display: 'flex',
            gap: 12,
            marginTop: 16,
            position: 'relative',
          }}
        >
          <QuickStat icon={<Flame size={16} />} label="Streak" value={`${gamification.areaStreak}d`} />
          <QuickStat icon={<Check size={16} />} label="Hoje" value={`${gamification.todayCompleted}/${gamification.todayTotal}`} />
          <QuickStat icon={<TrendingUp size={16} />} label="Semana" value={`${Math.round(gamification.weekPercent)}%`} />
          <QuickStat icon={<Calendar size={16} />} label="Melhor" value={gamification.bestDayName} />
        </div>
      </section>

      {/* Badges */}
      <section style={{ margin: '12px 16px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
          Conquistas
        </h2>
        <div
          style={{
            display: 'flex',
            gap: 10,
            overflowX: 'auto',
            paddingBottom: 8,
            scrollbarWidth: 'none',
          }}
        >
          {gamification.badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} color={grad1} />
          ))}
        </div>
      </section>

      {/* Habit Cards */}
      <section style={{ margin: '12px 16px' }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)' }}>
          Hábitos
        </h2>
        {areaHabits.length === 0 ? (
          <div
            style={{
              background: 'var(--bg-card)',
              borderRadius: 12,
              padding: '32px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: 14,
              border: '1px solid var(--border-subtle)',
            }}
          >
            Nenhum hábito nesta área ainda.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {areaHabits.map((habit) => {
              const progress = getHabitProgress(habit.id)
              const completed = isCompleted(habit.id, todayStr)
              const isActive = timer.activeHabitId === habit.id
              const goalMin = habit.goalMinutes ?? 30
              const todaySessions = getSessionsForHabitAndDate(habit.id, todayStr)
              const totalSecondsToday = getTotalSecondsForHabitAndDate(habit.id, todayStr)
              const lastSession = todaySessions[0]
              const timeProgressPercent =
                isActive
                  ? Math.min(100, (timer.elapsedSeconds / (goalMin * 60)) * 100)
                  : lastSession
                    ? Math.min(100, (lastSession.durationSeconds / (lastSession.goalMinutes * 60)) * 100)
                    : 0

              return (
                <motion.div
                  key={habit.id}
                  layout
                  style={{
                    background: 'var(--bg-card)',
                    borderRadius: 14,
                    padding: '16px 18px',
                    border: `1px solid ${completed ? grad1 + '40' : 'var(--border-subtle)'}`,
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {completed && (
                    <div
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: `linear-gradient(135deg, ${grad1}08, ${grad1}15)`,
                        pointerEvents: 'none',
                      }}
                    />
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, position: 'relative' }}>
                    {/* Progress: circular (completion) or bar (time) */}
                    <div style={{ position: 'relative', width: 48, height: 48, flexShrink: 0 }}>
                      {isActive || todaySessions.length > 0 ? (
                        <div style={{ width: 48, height: 48, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div
                            style={{
                              height: 6,
                              width: 48,
                              background: 'var(--bg-secondary)',
                              borderRadius: 3,
                              overflow: 'hidden',
                            }}
                          >
                            <motion.div
                              animate={{ width: `${timeProgressPercent}%` }}
                              transition={{ duration: 0.3 }}
                              style={{
                                height: '100%',
                                background: grad1,
                                borderRadius: 3,
                              }}
                            />
                          </div>
                          <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
                            {Math.round(timeProgressPercent)}%
                          </span>
                        </div>
                      ) : (
                        <>
                          <svg width={48} height={48} viewBox="0 0 48 48">
                            <circle
                              cx={24}
                              cy={24}
                              r={20}
                              fill="none"
                              stroke="var(--border-subtle)"
                              strokeWidth={3}
                            />
                            <circle
                              cx={24}
                              cy={24}
                              r={20}
                              fill="none"
                              stroke={grad1}
                              strokeWidth={3}
                              strokeDasharray={`${(progress / 100) * 125.6} 125.6`}
                              strokeLinecap="round"
                              transform="rotate(-90 24 24)"
                              style={{ transition: 'stroke-dasharray 0.5s ease' }}
                            />
                          </svg>
                          <span
                            style={{
                              position: 'absolute',
                              top: '50%',
                              left: '50%',
                              transform: 'translate(-50%, -50%)',
                              fontSize: 11,
                              fontWeight: 600,
                              color: 'var(--text-primary)',
                            }}
                          >
                            {Math.round(progress)}%
                          </span>
                        </>
                      )}
                    </div>

                    {/* Info + Time card */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {habit.name}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: 'var(--text-secondary)',
                          marginTop: 4,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            background: 'var(--bg-secondary)',
                            padding: '4px 8px',
                            borderRadius: 6,
                            fontSize: 11,
                            fontWeight: 500,
                          }}
                        >
                          {isActive
                            ? `${formatTimeDisplay(timer.elapsedSeconds)} / ${goalMin} min`
                            : totalSecondsToday > 0
                              ? `${Math.floor(totalSecondsToday / 60)} min hoje`
                              : `${goalMin} min meta`}
                        </span>
                        <span>+10 XP por conclusão</span>
                      </div>
                    </div>

                    {/* Actions: Play, Stop, Details, Pencil, Check */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {isActive ? (
                        <motion.button
                          onClick={() => handleStop(habit.id)}
                          whileTap={{ scale: 0.85 }}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: 'none',
                            background: grad1,
                            color: 'white',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title="Parar"
                        >
                          <Square size={16} fill="white" />
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => handlePlay(habit)}
                          whileTap={{ scale: 0.85 }}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: `2px solid var(--border-subtle)`,
                            background: 'transparent',
                            color: grad1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title="Iniciar"
                        >
                          <Play size={16} fill="currentColor" />
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => setDetailsHabit(habit)}
                        whileTap={{ scale: 0.85 }}
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: 10,
                          border: 'none',
                          background: 'var(--bg-secondary)',
                          color: 'var(--text-secondary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                        }}
                        title="Detalhes"
                      >
                        <Info size={16} />
                      </motion.button>
                      {onUpdateHabit && (
                        <motion.button
                          onClick={() => setEditHabit(habit)}
                          whileTap={{ scale: 0.85 }}
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            border: 'none',
                            background: 'var(--bg-secondary)',
                            color: 'var(--text-secondary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title="Editar meta"
                        >
                          <Pencil size={14} />
                        </motion.button>
                      )}
                      <motion.button
                        onClick={() => handleToggle(habit.id)}
                        whileTap={{ scale: 0.85 }}
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          border: completed ? 'none' : `2px solid var(--border-subtle)`,
                          background: completed
                            ? `linear-gradient(135deg, ${grad1}, ${grad2})`
                            : 'transparent',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          position: 'relative',
                        }}
                      >
                        {completed && <Check size={20} color="white" strokeWidth={3} />}
                        <AnimatePresence>
                          {xpPopup === habit.id && (
                            <motion.span
                              initial={{ opacity: 1, y: 0 }}
                              animate={{ opacity: 0, y: -30 }}
                              exit={{ opacity: 0 }}
                              transition={{ duration: 1 }}
                              style={{
                                position: 'absolute',
                                top: -8,
                                right: -4,
                                fontSize: 13,
                                fontWeight: 700,
                                color: grad1,
                                pointerEvents: 'none',
                              }}
                            >
                              +10 XP
                            </motion.span>
                          )}
                        </AnimatePresence>
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </section>

      {/* Faltando ou Fora do Lugar - apenas na área Organização */}
      {area.name === 'Organização' && <MissingItemsSection color={grad1} />}

      {/* Area Stats */}
      <section
        style={{
          background: 'var(--bg-card)',
          borderRadius: 12,
          padding: '20px',
          margin: '12px 16px',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text-primary)' }}>
          Progresso (últimos 7 dias)
        </h2>
        <div style={{ height: 120 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={gamification.dailyData}>
              <defs>
                <linearGradient id={`areaGrad-${area.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={grad1} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={grad1} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={(v: string) => v.slice(8)}
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                labelFormatter={(v: string) => v}
                formatter={(value: number) => [`${value}%`, 'Progresso']}
              />
              <RechartsArea
                type="monotone"
                dataKey="percent"
                stroke={grad1}
                strokeWidth={2}
                fill={`url(#areaGrad-${area.id})`}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      <AnimatePresence>
        {detailsHabit && (
          <HabitDetailsModal
            key="details"
            habit={detailsHabit}
            date={todayStr}
            sessions={getSessionsForHabitAndDate(detailsHabit.id, todayStr)}
            onClose={() => setDetailsHabit(null)}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {editHabit && onUpdateHabit && (
          <EditGoalModal
            key="edit"
            habit={editHabit}
            onSave={handleSaveGoal}
            onClose={() => setEditHabit(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

function QuickStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div
      style={{
        flex: 1,
        background: 'rgba(255,255,255,0.12)',
        borderRadius: 10,
        padding: '10px 8px',
        textAlign: 'center',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'center', color: 'white', marginBottom: 4 }}>
        {icon}
      </div>
      <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{value}</div>
      <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>{label}</div>
    </div>
  )
}

function BadgeCard({ badge, color }: { badge: Badge; color: string }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      style={{
        minWidth: 100,
        background: badge.unlocked ? 'var(--bg-card)' : 'var(--bg-secondary)',
        borderRadius: 12,
        padding: '14px 12px',
        textAlign: 'center',
        border: badge.unlocked ? `1px solid ${color}40` : '1px solid var(--border-subtle)',
        opacity: badge.unlocked ? 1 : 0.5,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {badge.unlocked && (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: `linear-gradient(135deg, ${color}08, ${color}15)`,
            pointerEvents: 'none',
          }}
        />
      )}
      <div style={{ fontSize: 28, marginBottom: 6, position: 'relative' }}>
        {badge.unlocked ? badge.icon : <Lock size={22} color="var(--text-secondary)" />}
      </div>
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: badge.unlocked ? 'var(--text-primary)' : 'var(--text-secondary)',
          position: 'relative',
        }}
      >
        {badge.name}
      </div>
      <div
        style={{
          fontSize: 9,
          color: 'var(--text-secondary)',
          marginTop: 2,
          position: 'relative',
        }}
      >
        {badge.description}
      </div>
    </motion.div>
  )
}
