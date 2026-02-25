export interface Area {
  id: string
  name: string
  color?: string
}

export interface Habit {
  id: string
  name: string
  areaId?: string
  color?: string
  createdAt: number
  goalMinutes?: number
}

export interface TimeSession {
  id: string
  habitId: string
  date: string
  startTime: string
  endTime: string
  durationSeconds: number
  goalMinutes: number
}

export interface Completion {
  id: string
  habitId: string
  date: string // YYYY-MM-DD
  completed: boolean
}

export interface PomodoroTask {
  id: string
  title: string
  completed: boolean
  order: number
  createdAt: number
}

export interface PomodoroSession {
  id: string
  date: string // YYYY-MM-DD
  completedAt: string // ISO
  taskId?: string
  taskTitle?: string
  habitId?: string
  durationMinutes: number
  feedback?: string
}

export interface PomodoroSettings {
  id?: string
  workMinutes: number
  shortBreakMinutes: number
  longBreakMinutes: number
  targetPomodoros?: number
}

export interface WimHofSession {
  id: string
  date: string // YYYY-MM-DD
  completedAt: string // ISO
  roundsCompleted: number // 1-4
  totalBreaths: number // rounds * 30
  /** Tempo de retenção (segundos) por rodada, em ordem */
  retentionSecondsByRound?: number[]
}

export interface MissingItem {
  id: string
  text: string
  createdAt: number
  resolved?: boolean
}

export interface SleepSession {
  id: string
  date: string // YYYY-MM-DD (dia em que acordou)
  sleepTime: string // HH:mm - hora que dormiu
  wakeTime: string // HH:mm - hora que acordou
  durationMinutes: number
  quality?: number // 1-5 opcional
  createdAt: number
}
