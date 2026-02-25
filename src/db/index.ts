import { openDB, DBSchema, IDBPDatabase } from 'idb'
import type { Habit, Completion, Area, TimeSession, PomodoroTask, PomodoroSession, PomodoroSettings, WimHofSession, MissingItem, SleepSession } from '../types'

interface HabitsDB extends DBSchema {
  habits: {
    key: string
    value: Habit
    indexes: { 'by-created': number }
  }
  completions: {
    key: string
    value: Completion
    indexes: { 'by-habit': string; 'by-date': string }
  }
  areas: {
    key: string
    value: Area
  }
  timeSessions: {
    key: string
    value: TimeSession
    indexes: { 'by-habit': string; 'by-date': string }
  }
  pomodoroTasks: {
    key: string
    value: PomodoroTask
    indexes: { 'by-order': number }
  }
  pomodoroSessions: {
    key: string
    value: PomodoroSession
    indexes: { 'by-date': string }
  }
  pomodoroSettings: {
    key: string
    value: PomodoroSettings
  }
  wimhofSessions: {
    key: string
    value: WimHofSession
    indexes: { 'by-date': string }
  }
  missingItems: {
    key: string
    value: MissingItem
    indexes: { 'by-created': number }
  }
  sleepSessions: {
    key: string
    value: SleepSession
    indexes: { 'by-date': string }
  }
}

const DB_NAME = 'rastreador-habitos'
const DB_VERSION = 7

let dbPromise: Promise<IDBPDatabase<HabitsDB>> | null = null

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<HabitsDB>(DB_NAME, DB_VERSION, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          const habitStore = db.createObjectStore('habits', { keyPath: 'id' })
          habitStore.createIndex('by-created', 'createdAt')

          const completionStore = db.createObjectStore('completions', { keyPath: 'id' })
          completionStore.createIndex('by-habit', 'habitId')
          completionStore.createIndex('by-date', 'date')
        }
        if (oldVersion < 2) {
          db.createObjectStore('areas', { keyPath: 'id' })
        }
        if (oldVersion < 3) {
          const timeSessionStore = db.createObjectStore('timeSessions', { keyPath: 'id' })
          timeSessionStore.createIndex('by-habit', 'habitId')
          timeSessionStore.createIndex('by-date', 'date')
        }
        if (oldVersion < 4) {
          const taskStore = db.createObjectStore('pomodoroTasks', { keyPath: 'id' })
          taskStore.createIndex('by-order', 'order')
          const sessionStore = db.createObjectStore('pomodoroSessions', { keyPath: 'id' })
          sessionStore.createIndex('by-date', 'date')
          db.createObjectStore('pomodoroSettings', { keyPath: 'id' })
        }
        if (oldVersion < 5) {
          const wimhofStore = db.createObjectStore('wimhofSessions', { keyPath: 'id' })
          wimhofStore.createIndex('by-date', 'date')
        }
        if (oldVersion < 6) {
          const missingStore = db.createObjectStore('missingItems', { keyPath: 'id' })
          missingStore.createIndex('by-created', 'createdAt')
        }
        if (oldVersion < 7) {
          const sleepStore = db.createObjectStore('sleepSessions', { keyPath: 'id' })
          sleepStore.createIndex('by-date', 'date')
        }
      },
    })
  }
  return dbPromise
}

export async function getAllHabits(): Promise<Habit[]> {
  const db = await getDB()
  return db.getAll('habits')
}

export async function addHabit(habit: Habit): Promise<void> {
  const db = await getDB()
  await db.add('habits', habit)
}

export async function updateHabit(habit: Habit): Promise<void> {
  const db = await getDB()
  await db.put('habits', habit)
}

export async function deleteHabit(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('habits', id)
  const completions = await db.getAllFromIndex('completions', 'by-habit', id)
  for (const c of completions) {
    await db.delete('completions', c.id)
  }
  const sessions = await db.getAllFromIndex('timeSessions', 'by-habit', id)
  for (const s of sessions) {
    await db.delete('timeSessions', s.id)
  }
}

export async function getCompletionsByHabit(habitId: string): Promise<Completion[]> {
  const db = await getDB()
  return db.getAllFromIndex('completions', 'by-habit', habitId)
}

export async function getCompletionsByDate(date: string): Promise<Completion[]> {
  const db = await getDB()
  return db.getAllFromIndex('completions', 'by-date', date)
}

export async function getAllCompletions(): Promise<Completion[]> {
  const db = await getDB()
  return db.getAll('completions')
}

export async function setCompletion(completion: Completion): Promise<void> {
  const db = await getDB()
  const existing = await db.get('completions', completion.id)
  if (existing) {
    await db.put('completions', completion)
  } else {
    await db.add('completions', completion)
  }
}

export async function toggleCompletion(habitId: string, date: string): Promise<boolean> {
  const id = `${habitId}-${date}`
  const db = await getDB()
  const existing = await db.get('completions', id)
  const newCompleted = !existing?.completed
  await setCompletion({
    id,
    habitId,
    date,
    completed: newCompleted,
  })
  return newCompleted
}

// Áreas
export async function getAllAreas(): Promise<Area[]> {
  const db = await getDB()
  return db.getAll('areas')
}

export async function addArea(area: Area): Promise<void> {
  const db = await getDB()
  await db.add('areas', area)
}

export async function deleteArea(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('areas', id)
}

export async function updateArea(area: Area): Promise<void> {
  const db = await getDB()
  await db.put('areas', area)
}

// Time Sessions
export async function addTimeSession(session: TimeSession): Promise<void> {
  const db = await getDB()
  await db.add('timeSessions', session)
}

export async function getTimeSessionsByHabit(habitId: string): Promise<TimeSession[]> {
  const db = await getDB()
  return db.getAllFromIndex('timeSessions', 'by-habit', habitId)
}

export async function getTimeSessionsByHabitAndDate(
  habitId: string,
  date: string
): Promise<TimeSession[]> {
  const db = await getDB()
  const all = await db.getAllFromIndex('timeSessions', 'by-habit', habitId)
  return all.filter((s) => s.date === date).sort((a, b) => b.startTime.localeCompare(a.startTime))
}

export async function getAllTimeSessions(): Promise<TimeSession[]> {
  const db = await getDB()
  return db.getAll('timeSessions')
}

// Pomodoro
const POMODORO_SETTINGS_KEY = 'pomodoro-settings'

export async function getPomodoroSettings(): Promise<PomodoroSettings> {
  const db = await getDB()
  const s = await db.get('pomodoroSettings', POMODORO_SETTINGS_KEY)
  const defaults = { workMinutes: 25, shortBreakMinutes: 5, longBreakMinutes: 15, targetPomodoros: 4 }
  if (!s) return defaults
  return { ...defaults, ...s }
}

export async function savePomodoroSettings(settings: PomodoroSettings): Promise<void> {
  const db = await getDB()
  await db.put('pomodoroSettings', { id: POMODORO_SETTINGS_KEY, ...settings })
}

export async function getAllPomodoroTasks(): Promise<PomodoroTask[]> {
  const db = await getDB()
  const tasks = await db.getAll('pomodoroTasks')
  return tasks.sort((a, b) => a.order - b.order)
}

export async function addPomodoroTask(task: Omit<PomodoroTask, 'id'>): Promise<PomodoroTask> {
  const db = await getDB()
  const t: PomodoroTask = { ...task, id: crypto.randomUUID() }
  await db.add('pomodoroTasks', t)
  return t
}

export async function updatePomodoroTask(task: PomodoroTask): Promise<void> {
  const db = await getDB()
  await db.put('pomodoroTasks', task)
}

export async function deletePomodoroTask(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('pomodoroTasks', id)
}

export async function getAllPomodoroSessions(): Promise<PomodoroSession[]> {
  const db = await getDB()
  const sessions = await db.getAll('pomodoroSessions')
  return sessions.sort((a, b) => b.completedAt.localeCompare(a.completedAt))
}

export async function addPomodoroSession(session: Omit<PomodoroSession, 'id'>): Promise<PomodoroSession> {
  const db = await getDB()
  const s: PomodoroSession = { ...session, id: crypto.randomUUID() }
  await db.add('pomodoroSessions', s)
  return s
}

// Wim Hof
export async function getAllWimHofSessions(): Promise<WimHofSession[]> {
  const db = await getDB()
  const sessions = await db.getAll('wimhofSessions')
  return sessions.sort((a, b) => b.completedAt.localeCompare(a.completedAt))
}

export async function addWimHofSession(
  session: Omit<WimHofSession, 'id'>
): Promise<WimHofSession> {
  const db = await getDB()
  const s: WimHofSession = { ...session, id: crypto.randomUUID() }
  await db.add('wimhofSessions', s)
  return s
}

// Missing Items (Faltando ou Fora do Lugar)
export async function getAllMissingItems(): Promise<MissingItem[]> {
  const db = await getDB()
  const items = await db.getAll('missingItems')
  return items.sort((a, b) => b.createdAt - a.createdAt)
}

export async function addMissingItem(item: Omit<MissingItem, 'id'>): Promise<MissingItem> {
  const db = await getDB()
  const m: MissingItem = { ...item, id: crypto.randomUUID() }
  await db.add('missingItems', m)
  return m
}

export async function updateMissingItem(item: MissingItem): Promise<void> {
  const db = await getDB()
  await db.put('missingItems', item)
}

export async function deleteMissingItem(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('missingItems', id)
}

// Sleep Sessions
export async function getAllSleepSessions(): Promise<SleepSession[]> {
  const db = await getDB()
  const sessions = await db.getAll('sleepSessions')
  return sessions.sort((a, b) => b.date.localeCompare(a.date))
}

export async function getSleepSessionsByDate(date: string): Promise<SleepSession[]> {
  const db = await getDB()
  return db.getAllFromIndex('sleepSessions', 'by-date', date)
}

export async function addSleepSession(session: Omit<SleepSession, 'id'>): Promise<SleepSession> {
  const db = await getDB()
  const s: SleepSession = { ...session, id: crypto.randomUUID() }
  await db.add('sleepSessions', s)
  return s
}

export async function updateSleepSession(session: SleepSession): Promise<void> {
  const db = await getDB()
  await db.put('sleepSessions', session)
}

export async function deleteSleepSession(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('sleepSessions', id)
}
