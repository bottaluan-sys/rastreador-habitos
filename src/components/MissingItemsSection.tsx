import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Check, Trash2, AlertCircle } from 'lucide-react'
import { useMissingItems } from '../hooks/useMissingItems'

interface MissingItemsSectionProps {
  color: string
}

export function MissingItemsSection({ color }: MissingItemsSectionProps) {
  const { items, add, toggleResolved, remove } = useMissingItems()
  const [newText, setNewText] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAdd = async () => {
    if (!newText.trim()) return
    await add(newText)
    setNewText('')
    setIsAdding(false)
  }

  return (
    <section style={{ margin: '12px 16px' }}>
      <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 8 }}>
        <AlertCircle size={18} color={color} />
        Faltando ou Fora do Lugar
      </h2>
      <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
        Coisas quebradas, faltando ou fora do lugar para arrumar depois.
      </p>

      <div
        style={{
          background: 'var(--bg-card)',
          borderRadius: 14,
          border: '1px solid var(--border-subtle)',
          overflow: 'hidden',
        }}
      >
        {/* Input para adicionar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-subtle)' }}>
          {isAdding ? (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input
                type="text"
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAdd()
                  if (e.key === 'Escape') {
                    setNewText('')
                    setIsAdding(false)
                  }
                }}
                placeholder="Ex: Lâmpada do quarto queimada..."
                autoFocus
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: 10,
                  border: '1px solid var(--border-subtle)',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-primary)',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
              <motion.button
                onClick={handleAdd}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '10px 16px',
                  background: color,
                  color: 'white',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <Plus size={16} />
                Adicionar
              </motion.button>
              <motion.button
                onClick={() => {
                  setNewText('')
                  setIsAdding(false)
                }}
                whileTap={{ scale: 0.95 }}
                style={{
                  padding: '10px 14px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: 10,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                Cancelar
              </motion.button>
            </div>
          ) : (
            <motion.button
              onClick={() => setIsAdding(true)}
              whileTap={{ scale: 0.98 }}
              style={{
                width: '100%',
                padding: '12px 16px',
                background: 'var(--bg-secondary)',
                border: `2px dashed ${color}40`,
                borderRadius: 10,
                color: color,
                fontSize: 14,
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <Plus size={18} />
              Adicionar item
            </motion.button>
          )}
        </div>

        {/* Lista de itens */}
        <div style={{ maxHeight: 200, overflowY: 'auto' }}>
          {items.length === 0 ? (
            <div
              style={{
                padding: '24px 16px',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: 14,
              }}
            >
              Nenhum item. Tudo em ordem!
            </div>
          ) : (
            <AnimatePresence>
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--border-subtle)',
                    background: item.resolved ? 'var(--bg-secondary)' : 'transparent',
                  }}
                >
                  <motion.button
                    onClick={() => toggleResolved(item.id)}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      border: item.resolved ? 'none' : `2px solid ${color}`,
                      background: item.resolved ? color : 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      flexShrink: 0,
                    }}
                  >
                    {item.resolved && <Check size={16} color="white" strokeWidth={3} />}
                  </motion.button>
                  <span
                    style={{
                      flex: 1,
                      fontSize: 14,
                      color: item.resolved ? 'var(--text-secondary)' : 'var(--text-primary)',
                      textDecoration: item.resolved ? 'line-through' : 'none',
                    }}
                  >
                    {item.text}
                  </span>
                  <motion.button
                    onClick={() => remove(item.id)}
                    whileTap={{ scale: 0.9 }}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      border: 'none',
                      background: 'transparent',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Remover"
                  >
                    <Trash2 size={16} />
                  </motion.button>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  )
}
