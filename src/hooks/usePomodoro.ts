import { useState, useEffect, useCallback } from 'react'
import type { PomodoroTask, PomodoroSession, PomodoroSettings } from '../types'
import {
  getPomodoroSettings,
  savePomodoroSettings,
  getAllPomodoroTasks,
  addPomodoroTask as dbAddTask,
  updatePomodoroTask as dbUpdateTask,
  deletePomodoroTask as dbDeleteTask,
  getAllPomodoroSessions,
  addPomodoroSession as dbAddSession,
} from '../db'

export function usePomodoro() {
  const [settings, setSettings] = useState<PomodoroSettings>({
    workMinutes: 25,
    shortBreakMinutes: 5,
    longBreakMinutes: 15,
  })
  const [tasks, setTasks] = useState<PomodoroTask[]>([])
  const [sessions, setSessions] = useState<PomodoroSession[]>([])

  const loadSettings = useCallback(async () => {
    const s = await getPomodoroSettings()
    setSettings(s)
  }, [])

  const loadTasks = useCallback(async () => {
    const t = await getAllPomodoroTasks()
    setTasks(t)
  }, [])

  const loadSessions = useCallback(async () => {
    const s = await getAllPomodoroSessions()
    setSessions(s)
  }, [])

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  useEffect(() => {
    loadTasks()
  }, [loadTasks])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  const updateSettings = useCallback(async (s: Partial<PomodoroSettings>) => {
    const next = { ...settings, ...s }
    await savePomodoroSettings(next)
    setSettings(next)
  }, [settings])

  const addTask = useCallback(async (title: string) => {
    const maxOrder = tasks.length > 0 ? Math.max(...tasks.map((t) => t.order)) : -1
    const task = await dbAddTask({
      title: title.trim(),
      completed: false,
      order: maxOrder + 1,
      createdAt: Date.now(),
    })
    setTasks((prev) => [...prev, task].sort((a, b) => a.order - b.order))
    return task
  }, [tasks])

  const toggleTask = useCallback(async (id: string) => {
    const task = tasks.find((t) => t.id === id)
    if (!task) return
    const updated = { ...task, completed: !task.completed }
    await dbUpdateTask(updated)
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)))
  }, [tasks])

  const removeTask = useCallback(async (id: string) => {
    await dbDeleteTask(id)
    setTasks((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addSession = useCallback(async (session: Omit<PomodoroSession, 'id'>) => {
    const s = await dbAddSession(session)
    setSessions((prev) => [s, ...prev])
    return s
  }, [])

  return {
    settings,
    updateSettings,
    tasks,
    addTask,
    toggleTask,
    removeTask,
    sessions,
    addSession,
    refreshTasks: loadTasks,
    refreshSessions: loadSessions,
  }
}
