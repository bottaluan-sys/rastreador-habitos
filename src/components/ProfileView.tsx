import { useState, useEffect } from 'react'
import { User, Flame } from 'lucide-react'
import { getStoredGoal, setStoredGoal } from './GoalGauge'

const STORAGE_NAME = 'rastreador-user-name'

function loadUserName(): string {
  return localStorage.getItem(STORAGE_NAME) ?? ''
}

function saveUserName(name: string) {
  localStorage.setItem(STORAGE_NAME, name)
}

interface ProfileViewProps {
  currentStreak: number
  longestStreak: number
}

export function ProfileView({ currentStreak, longestStreak }: ProfileViewProps) {
  const [userName, setUserNameState] = useState(loadUserName)
  const [goalPercent, setGoalPercentState] = useState(getStoredGoal)

  useEffect(() => {
    saveUserName(userName)
  }, [userName])

  const setGoalPercent = (p: number) => {
    setGoalPercentState(p)
    setStoredGoal(p)
  }

  return (
    <section
      style={{
        background: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '24px',
        margin: '16px 20px',
        border: '1px solid var(--border-subtle)',
      }}
    >
      <h2 style={{ fontSize: '18px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <User size={20} />
        Perfil
      </h2>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 6 }}>
          Nome
        </label>
        <input
          type="text"
          value={userName}
          onChange={(e) => setUserNameState(e.target.value)}
          placeholder="Seu nome"
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '8px',
            color: 'var(--text-primary)',
            fontSize: '14px',
          }}
        />
      </div>

      <div style={{ marginBottom: '20px' }}>
        <label style={{ display: 'block', fontSize: '13px', color: 'var(--text-secondary)', marginBottom: 6 }}>
          Meta diária (% dos hábitos)
        </label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input
            type="range"
            min="50"
            max="100"
            step="5"
            value={goalPercent}
            onChange={(e) => setGoalPercent(parseInt(e.target.value, 10))}
            style={{ flex: 1 }}
          />
          <span style={{ fontSize: '16px', fontWeight: 600, minWidth: 40 }}>{goalPercent}%</span>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          gap: '24px',
          padding: '16px',
          background: 'var(--bg-secondary)',
          borderRadius: '8px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--accent-red)' }}>
          <Flame size={24} />
          <div>
            <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Streak atual</div>
            <div style={{ fontSize: '20px', fontWeight: 700 }}>{currentStreak} dias</div>
          </div>
        </div>
        <div>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Maior streak</div>
          <div style={{ fontSize: '20px', fontWeight: 700 }}>{longestStreak} dias</div>
        </div>
      </div>
    </section>
  )
}
