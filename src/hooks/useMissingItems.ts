import { useState, useEffect, useCallback } from 'react'
import type { MissingItem } from '../types'
import { getAllMissingItems, addMissingItem, updateMissingItem, deleteMissingItem } from '../db'

export function useMissingItems() {
  const [items, setItems] = useState<MissingItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllMissingItems()
      setItems(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const add = useCallback(async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const item = await addMissingItem({
      text: trimmed,
      createdAt: Date.now(),
      resolved: false,
    })
    setItems((prev) => [item, ...prev])
  }, [])

  const toggleResolved = useCallback(async (id: string) => {
    const item = items.find((i) => i.id === id)
    if (!item) return
    const updated = { ...item, resolved: !item.resolved }
    await updateMissingItem(updated)
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)))
  }, [items])

  const remove = useCallback(async (id: string) => {
    await deleteMissingItem(id)
    setItems((prev) => prev.filter((i) => i.id !== id))
  }, [])

  return { items, loading, add, toggleResolved, remove, refresh: load }
}
