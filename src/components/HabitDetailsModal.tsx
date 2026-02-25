import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Habit, TimeSession } from '../types'

function formatTime(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60)
  return `${m} min`
}

interface HabitDetailsModalProps {
  habit: Habit
  date: string
  sessions: TimeSession[]
  onClose: () => void
}

export function HabitDetailsModal({
  habit,
  date,
  sessions,
  onClose,
}: HabitDetailsModalProps) {
  const formattedDate = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  })

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: 24,
          width: '90%',
          maxWidth: 400,
          maxHeight: '80vh',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: 0,
              }}
            >
              Detalhes - {habit.name}
            </h3>
            <p
              style={{
                fontSize: 13,
                color: 'var(--text-secondary)',
                margin: '4px 0 0',
              }}
            >
              {formattedDate}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              padding: 8,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {sessions.length === 0 ? (
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: 14,
                textAlign: 'center',
                padding: 24,
              }}
            >
              Nenhuma sessão registrada neste dia.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {sessions.map((s) => (
                <div
                  key={s.id}
                  style={{
                    background: 'var(--bg-secondary)',
                    borderRadius: 12,
                    padding: '14px 16px',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--text-primary)',
                    }}
                  >
                    {formatTime(s.startTime)} - {formatTime(s.endTime)}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-secondary)',
                      marginTop: 4,
                    }}
                  >
                    {formatDuration(s.durationSeconds)} / meta {s.goalMinutes} min
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
