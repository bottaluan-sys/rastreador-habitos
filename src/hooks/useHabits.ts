import { useState, useEffect, useCallback } from 'react'
import type { Habit } from '../types'
import { getAllHabits, addHabit, updateHabit, deleteHabit } from '../db'

export function useHabits() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)

  const loadHabits = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllHabits()
      setHabits(data.sort((a, b) => a.createdAt - b.createdAt))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadHabits()
  }, [loadHabits])

  const add = useCallback(async (name: string, areaId?: string) => {
    const habit: Habit = {
      id: crypto.randomUUID(),
      name: name.trim(),
      areaId,
      createdAt: Date.now(),
    }
    await addHabit(habit)
    setHabits((prev) => [...prev, habit].sort((a, b) => a.createdAt - b.createdAt))
    return habit
  }, [])

  const update = useCallback(async (habit: Habit) => {
    await updateHabit(habit)
    setHabits((prev) =>
      prev.map((h) => (h.id === habit.id ? habit : h)).sort((a, b) => a.createdAt - b.createdAt)
    )
  }, [])

  const remove = useCallback(async (id: string) => {
    await deleteHabit(id)
    setHabits((prev) => prev.filter((h) => h.id !== id))
  }, [])

  return { habits, loading, add, update, remove, refresh: loadHabits }
}
