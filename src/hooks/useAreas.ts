import { useState, useEffect, useCallback } from 'react'
import type { Area } from '../types'
import { getAllAreas, addArea, deleteArea } from '../db'

export function useAreas() {
  const [areas, setAreas] = useState<Area[]>([])
  const [loading, setLoading] = useState(true)

  const loadAreas = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllAreas()
      const seen = new Set<string>()
      const unique = data.filter((a) => {
        if (seen.has(a.name)) return false
        seen.add(a.name)
        return true
      })
      setAreas(unique)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadAreas()
  }, [loadAreas])

  const add = useCallback(async (name: string, color?: string) => {
    const trimmed = name.trim()
    const existing = await getAllAreas()
    const found = existing.find((a) => a.name === trimmed)
    if (found) return found
    const area: Area = {
      id: crypto.randomUUID(),
      name: trimmed,
      color,
    }
    await addArea(area)
    setAreas((prev) => [...prev, area])
    return area
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteArea(id)
    setAreas((prev) => prev.filter((a) => a.id !== id))
  }, [])

  return { areas, loading, add, remove, refresh: loadAreas }
}
