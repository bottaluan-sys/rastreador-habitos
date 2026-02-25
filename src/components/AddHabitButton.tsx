import { Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import type { Area } from '../types'
import { getAreaIcon } from '../constants/areaIcons'

interface AddHabitButtonProps {
  onAdd: (name: string, areaId?: string) => void
  areas: Area[]
  onAddArea?: (name: string) => Promise<Area>
}

export function AddHabitButton({ onAdd, areas, onAddArea }: AddHabitButtonProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [selectedAreaId, setSelectedAreaId] = useState<string>('')
  const [showNewArea, setShowNewArea] = useState(false)
  const [newAreaName, setNewAreaName] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) {
      onAdd(name.trim(), selectedAreaId || undefined)
      setName('')
      setSelectedAreaId('')
      setOpen(false)
    }
  }

  const handleAddArea = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newAreaName.trim() && onAddArea) {
      const area = await onAddArea(newAreaName.trim())
      setSelectedAreaId(area.id)
      setNewAreaName('')
      setShowNewArea(false)
    }
  }

  return (
    <>
      <div style={{ padding: '0 16px 12px', display: 'flex', justifyContent: 'flex-end' }}>
        <motion.button
          onClick={() => setOpen(true)}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            background: 'var(--accent-red)',
            color: 'white',
            borderRadius: 'var(--radius-md)',
            fontSize: '14px',
            fontWeight: 600,
            boxShadow: 'var(--shadow-card)',
            transition: 'background var(--transition-fast), box-shadow var(--transition-fast)',
          }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--accent-red-hover)'
          e.currentTarget.style.boxShadow = 'var(--shadow-elevated)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'var(--accent-red)'
          e.currentTarget.style.boxShadow = 'var(--shadow-card)'
        }}
        >
          <Plus size={18} />
          Adicionar hábito
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000,
            }}
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-xl)',
                padding: '24px',
                width: '90%',
                maxWidth: 400,
                border: '1px solid var(--border-subtle)',
                boxShadow: 'var(--shadow-elevated)',
              }}
            >
              <h3
                style={{
                  fontSize: '18px',
                  marginBottom: '16px',
                  color: 'var(--text-primary)',
                }}
              >
                Novo hábito
              </h3>
              <form onSubmit={handleSubmit}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome do hábito"
                  autoFocus
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-primary)',
                    fontSize: '14px',
                    marginBottom: '12px',
                    transition: 'box-shadow var(--transition-fast)',
                  }}
                />
                <div style={{ marginBottom: '16px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      marginBottom: '8px',
                    }}
                  >
                    Área
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => setSelectedAreaId('')}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '10px 14px',
                        background: selectedAreaId === '' ? 'var(--accent-red)' : 'var(--bg-secondary)',
                        color: selectedAreaId === '' ? 'white' : 'var(--text-primary)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        fontSize: '14px',
                        cursor: 'pointer',
                      }}
                    >
                      Nenhuma
                    </button>
                    {areas.map((a) => {
                      const AreaIcon = getAreaIcon(a.name)
                      const isSelected = selectedAreaId === a.id
                      return (
                        <button
                          key={a.id}
                          type="button"
                          onClick={() => setSelectedAreaId(a.id)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '10px 14px',
                            background: isSelected ? 'var(--accent-red)' : 'var(--bg-secondary)',
                            color: isSelected ? 'white' : 'var(--text-primary)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: '8px',
                            fontSize: '14px',
                            cursor: 'pointer',
                          }}
                        >
                          <AreaIcon
                            size={18}
                            style={{ color: isSelected ? 'white' : a.color ?? 'var(--text-secondary)' }}
                          />
                          {a.name}
                        </button>
                      )
                    })}
                  </div>
                  {onAddArea && (
                    <button
                      type="button"
                      onClick={() => setShowNewArea(true)}
                      style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        color: 'var(--accent-red)',
                        background: 'none',
                        padding: 0,
                      }}
                    >
                      + Criar nova área
                    </button>
                  )}
                  {showNewArea && (
                    <form
                      onSubmit={handleAddArea}
                      style={{
                        marginTop: '8px',
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center',
                      }}
                    >
                      <input
                        type="text"
                        value={newAreaName}
                        onChange={(e) => setNewAreaName(e.target.value)}
                        placeholder="Nome da área (ex: Estudo, Treino)"
                        autoFocus
                        style={{
                          flex: 1,
                          padding: '8px 12px',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-subtle)',
                          borderRadius: '8px',
                          color: 'var(--text-primary)',
                          fontSize: '13px',
                        }}
                      />
                      <button
                        type="submit"
                        disabled={!newAreaName.trim()}
                        style={{
                          padding: '8px 14px',
                          background: 'var(--accent-red)',
                          color: 'white',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        Criar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowNewArea(false)
                          setNewAreaName('')
                        }}
                        style={{
                          padding: '8px',
                          color: 'var(--text-secondary)',
                          fontSize: '12px',
                        }}
                      >
                        Cancelar
                      </button>
                    </form>
                  )}
                </div>
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{
                      padding: '10px 20px',
                      color: 'var(--text-secondary)',
                      fontSize: '14px',
                    }}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!name.trim()}
                    style={{
                      padding: '10px 20px',
                      background: 'var(--accent-red)',
                      color: 'white',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                    }}
                  >
                    Adicionar
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
