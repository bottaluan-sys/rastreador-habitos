import { useState, useEffect, useCallback } from 'react'
import type { Completion } from '../types'
import { getAllCompletions, toggleCompletion as dbToggle } from '../db'

export function useCompletions() {
  const [completions, setCompletions] = useState<Completion[]>([])

  const loadCompletions = useCallback(async () => {
    const data = await getAllCompletions()
    setCompletions(data)
  }, [])

  useEffect(() => {
    loadCompletions()
  }, [loadCompletions])

  const isCompleted = useCallback(
    (habitId: string, date: string): boolean => {
      const c = completions.find((x) => x.habitId === habitId && x.date === date)
      return c?.completed ?? false
    },
    [completions]
  )

  const toggleCompletion = useCallback(
    async (habitId: string, date: string) => {
      const newCompleted = await dbToggle(habitId, date)
      const id = `${habitId}-${date}`
      setCompletions((prev) => {
        const existing = prev.find((x) => x.id === id)
        if (existing) {
          return prev.map((x) => (x.id === id ? { ...x, completed: newCompleted } : x))
        }
        return [...prev, { id, habitId, date, completed: newCompleted }]
      })
      return newCompleted
    },
    []
  )

  return { completions, isCompleted, toggleCompletion, refresh: loadCompletions }
}
