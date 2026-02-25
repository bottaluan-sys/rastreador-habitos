import { useState } from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import type { Habit } from '../types'

interface EditGoalModalProps {
  habit: Habit
  onSave: (habit: Habit) => Promise<void>
  onClose: () => void
}

export function EditGoalModal({ habit, onSave, onClose }: EditGoalModalProps) {
  const [goalMinutes, setGoalMinutes] = useState(habit.goalMinutes ?? 30)
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const value = Math.max(1, Math.min(999, goalMinutes))
    setSaving(true)
    try {
      await onSave({ ...habit, goalMinutes: value })
      onClose()
    } finally {
      setSaving(false)
    }
  }

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
          maxWidth: 360,
          border: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
          }}
        >
          <h3
            style={{
              fontSize: 18,
              fontWeight: 600,
              color: 'var(--text-primary)',
              margin: 0,
            }}
          >
            Editar meta de tempo
          </h3>
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

        <p
          style={{
            fontSize: 14,
            color: 'var(--text-secondary)',
            marginBottom: 16,
          }}
        >
          {habit.name}
        </p>

        <form onSubmit={handleSubmit}>
          <label
            style={{
              display: 'block',
              fontSize: 12,
              color: 'var(--text-secondary)',
              marginBottom: 8,
            }}
          >
            Meta (minutos por sessão)
          </label>
          <input
            type="number"
            min={1}
            max={999}
            value={goalMinutes}
            onChange={(e) => setGoalMinutes(Number(e.target.value) || 30)}
            style={{
              width: '100%',
              padding: '12px 16px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 8,
              color: 'var(--text-primary)',
              fontSize: 16,
              marginBottom: 20,
            }}
          />
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '10px 20px',
                color: 'var(--text-secondary)',
                fontSize: 14,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              style={{
                padding: '10px 20px',
                background: 'var(--accent-red)',
                color: 'white',
                borderRadius: 8,
                fontSize: 14,
                fontWeight: 600,
                border: 'none',
                cursor: saving ? 'not-allowed' : 'pointer',
              }}
            >
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  )
}
