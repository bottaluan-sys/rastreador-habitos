import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import type { Area } from '../types'
import { getAreaIcon } from '../constants/areaIcons'

const AREA_COLOR_PRESETS = [
  '#22c55e', '#3b82f6', '#a855f7', '#eab308', '#ef4444', '#ec4899',
  '#06b6d4', '#f97316', '#84cc16', '#6366f1',
]

interface AreasManagerProps {
  areas: Area[]
  onAdd: (name: string, color?: string) => Promise<Area>
  onRemove: (id: string) => Promise<void>
}

export function AreasManager({ areas, onAdd, onRemove }: AreasManagerProps) {
  const [showForm, setShowForm] = useState(false)
  const [newName, setNewName] = useState('')
  const [selectedColor, setSelectedColor] = useState(AREA_COLOR_PRESETS[0])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newName.trim()) {
      await onAdd(newName.trim(), selectedColor)
      setNewName('')
      setSelectedColor(AREA_COLOR_PRESETS[0])
      setShowForm(false)
    }
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
      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Áreas</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
        Organize seus hábitos por área (Corpo, Mente, Espírito, Financeiro, etc.)
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 16px' }}>
        {areas.map((a) => {
          const AreaIcon = getAreaIcon(a.name)
          return (
            <li
              key={a.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                background: 'var(--bg-secondary)',
                borderRadius: '8px',
                marginBottom: '8px',
                fontSize: '14px',
              }}
            >
              <AreaIcon
                size={18}
                style={{ color: a.color ?? 'var(--text-secondary)', flexShrink: 0 }}
              />
              <span style={{ flex: 1 }}>{a.name}</span>
              <button
                type="button"
                onClick={() => onRemove(a.id)}
                title="Remover área"
                style={{
                  padding: '6px',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.background = 'var(--bg-card)'
                  e.currentTarget.style.color = 'var(--accent-red)'
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = 'var(--text-secondary)'
                }}
              >
                <Trash2 size={18} />
              </button>
            </li>
          )
        })}
      </ul>
      {showForm ? (
        <form
          onSubmit={handleSubmit}
          style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        >
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Nome da área (ex: Saúde, Trabalho)"
              autoFocus
              style={{
                flex: 1,
                minWidth: 140,
                padding: '10px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                fontSize: '14px',
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Cor:</span>
              <div style={{ display: 'flex', gap: '4px' }}>
                {AREA_COLOR_PRESETS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setSelectedColor(c)}
                    title={c}
                    style={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      background: c,
                      border: selectedColor === c ? '2px solid white' : '2px solid transparent',
                      boxShadow: selectedColor === c ? '0 0 0 1px var(--border-subtle)' : 'none',
                      cursor: 'pointer',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="submit"
            disabled={!newName.trim()}
            style={{
              padding: '10px 18px',
              background: 'var(--accent-red)',
              color: 'white',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
            }}
          >
            Criar
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(false)
              setNewName('')
              setSelectedColor(AREA_COLOR_PRESETS[0])
            }}
            style={{
              padding: '10px',
              color: 'var(--text-secondary)',
              fontSize: '14px',
            }}
          >
            Cancelar
          </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 16px',
            background: 'var(--bg-secondary)',
            border: '1px dashed var(--border-subtle)',
            borderRadius: '8px',
            color: 'var(--text-secondary)',
            fontSize: '14px',
          }}
        >
          <Plus size={18} />
          Nova área
        </button>
      )}
    </section>
  )
}
