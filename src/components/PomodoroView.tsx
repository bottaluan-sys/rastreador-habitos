import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Flower2,
  Play,
  Pause,
  RotateCcw,
  ChevronDown,
  Pencil,
  Plus,
  Trash2,
  Check,
  ListTodo,
  FileText,
  ChevronRight,
  Settings2,
  Target,
  Clock,
  Circle,
  ClipboardList,
} from 'lucide-react'
import { useHabits } from '../hooks/useHabits'
import { useAreas } from '../hooks/useAreas'
import { useCompletions } from '../hooks/useCompletions'
import { useTimeSessions } from '../hooks/useTimeSessions'
import { usePomodoro } from '../hooks/usePomodoro'
import { formatDate } from '../utils/dateUtils'
import { SunflowerAnimation } from './SunflowerAnimation'

const POMODOROS_BEFORE_LONG_BREAK = 4

type Phase = 'work' | 'shortBreak' | 'longBreak'

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
}

const phaseConfig = {
  work: {
    label: 'Foco',
    accent: 'var(--accent-red)',
    accentSoft: 'var(--accent-red-soft)',
    gradient: 'linear-gradient(135deg, #e63946 0%, #c1121f 100%)',
    ringColor: 'rgba(230, 57, 70, 0.25)',
  },
  shortBreak: {
    label: 'Pausa curta',
    accent: 'var(--accent-green)',
    accentSoft: 'rgba(42, 157, 143, 0.2)',
    gradient: 'linear-gradient(135deg, #2a9d8f 0%, #1d7a6f 100%)',
    ringColor: 'rgba(42, 157, 143, 0.25)',
  },
  longBreak: {
    label: 'Pausa longa',
    accent: 'var(--accent-green)',
    accentSoft: 'rgba(42, 157, 143, 0.2)',
    gradient: 'linear-gradient(135deg, #2a9d8f 0%, #1d7a6f 100%)',
    ringColor: 'rgba(42, 157, 143, 0.25)',
  },
}

export function PomodoroView() {
  const { habits } = useHabits()
  const { areas } = useAreas()
  const { isCompleted, toggleCompletion } = useCompletions()
  const { addSession, getTotalSecondsForHabitAndDate } = useTimeSessions()
  const {
    settings,
    updateSettings,
    tasks,
    addTask,
    toggleTask,
    removeTask,
    sessions,
    addSession: addPomodoroSession,
  } = usePomodoro()

  const workMinutes = settings.workMinutes
  const shortBreakMinutes = settings.shortBreakMinutes
  const longBreakMinutes = settings.longBreakMinutes
  const targetPomodoros = settings.targetPomodoros ?? 4

  const [phase, setPhase] = useState<Phase>('work')
  const [secondsLeft, setSecondsLeft] = useState(workMinutes * 60)
  const [isRunning, setIsRunning] = useState(false)
  const [pomodoroCount, setPomodoroCount] = useState(0)
  const [workStartTime, setWorkStartTime] = useState<Date | null>(null)
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [editingTarget, setEditingTarget] = useState(false)
  const [editingWorkMin, setEditingWorkMin] = useState(false)
  const [editingShortBreak, setEditingShortBreak] = useState(false)
  const [editingLongBreak, setEditingLongBreak] = useState(false)
  const [editWorkMinValue, setEditWorkMinValue] = useState('')
  const [editShortBreakValue, setEditShortBreakValue] = useState('')
  const [editLongBreakValue, setEditLongBreakValue] = useState('')
  const [editTargetValue, setEditTargetValue] = useState('')
  const [showAreaDropdown, setShowAreaDropdown] = useState(false)
  const [showHabitDropdown, setShowHabitDropdown] = useState(false)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [pendingComplete, setPendingComplete] = useState<{
    taskId?: string
    taskTitle?: string
    habitId?: string
    durationMinutes: number
  } | null>(null)
  const [showSettings, setShowSettings] = useState(false)
  const [showStorageArea, setShowStorageArea] = useState(false)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission | null>(
    () => (typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : null)
  )
  const sectionRef = useRef<HTMLElement>(null)

  const habitsInArea = selectedAreaId
    ? habits.filter((h) => h.areaId === selectedAreaId)
    : habits
  const selectedArea = areas.find((a) => a.id === selectedAreaId)
  const selectedHabit = habits.find((h) => h.id === selectedHabitId)
  const selectedTask = tasks.find((t) => t.id === selectedTaskId)
  const activeTasks = tasks.filter((t) => !t.completed)
  const config = phaseConfig[phase]

  const totalSeconds =
    phase === 'work'
      ? workMinutes * 60
      : phase === 'shortBreak'
        ? shortBreakMinutes * 60
        : longBreakMinutes * 60

  const progressInPhase = ((totalSeconds - secondsLeft) / totalSeconds) * 100

  const progressForSunflower =
    phase === 'work'
      ? progressInPhase
      : phase === 'shortBreak' || phase === 'longBreak'
        ? 100
        : 0

  const startPhase = useCallback(
    (p: Phase) => {
      setPhase(p)
      const mins =
        p === 'work'
          ? workMinutes
          : p === 'shortBreak'
            ? shortBreakMinutes
            : longBreakMinutes
      setSecondsLeft(mins * 60)
      setIsRunning(true)
      if (p === 'work') {
        setWorkStartTime(new Date())
      } else {
        setWorkStartTime(null)
      }
    },
    [workMinutes, shortBreakMinutes, longBreakMinutes]
  )

  const handleComplete = useCallback(async () => {
    setIsRunning(false)
    if (phase === 'work') {
      const durationMinutes = workMinutes
      const taskId = selectedTaskId
      const taskTitle = selectedTask?.title
      const habitId = selectedHabitId

      if (selectedHabitId && workStartTime) {
        const endTime = new Date()
        const date = formatDate(workStartTime)
        const goalMinutes = selectedHabit?.goalMinutes ?? workMinutes
        const totalBefore = getTotalSecondsForHabitAndDate(selectedHabitId, date)
        const session = await addSession(
          selectedHabitId,
          date,
          workStartTime.toISOString(),
          endTime.toISOString(),
          goalMinutes
        )
        const totalAfter = totalBefore + session.durationSeconds
        const goalSeconds = goalMinutes * 60
        if (totalAfter >= goalSeconds && !isCompleted(selectedHabitId, date)) {
          await toggleCompletion(selectedHabitId, date)
        }
      }
      setWorkStartTime(null)

      setPendingComplete({
        taskId: taskId ?? undefined,
        taskTitle: taskTitle ?? undefined,
        habitId: habitId ?? undefined,
        durationMinutes,
      })
      setShowFeedbackModal(true)
      setFeedbackText('')
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Pomodoro concluído!', {
          body: 'Hora de registrar seu progresso e fazer uma pausa.',
          icon: '/favicon.ico',
        })
      }
    } else {
      startPhase('work')
    }
  }, [
    phase,
    workMinutes,
    selectedHabitId,
    workStartTime,
    addSession,
    getTotalSecondsForHabitAndDate,
    isCompleted,
    toggleCompletion,
    selectedHabit,
    selectedTaskId,
    selectedTask,
    startPhase,
  ])

  const skipFeedbackAndContinue = useCallback(async () => {
    if (!pendingComplete) return
    const date = formatDate(new Date())
    await addPomodoroSession({
      date,
      completedAt: new Date().toISOString(),
      taskId: pendingComplete.taskId,
      taskTitle: pendingComplete.taskTitle,
      habitId: pendingComplete.habitId,
      durationMinutes: pendingComplete.durationMinutes,
    })
    if (pendingComplete.taskId) {
      const task = tasks.find((t) => t.id === pendingComplete.taskId)
      if (task) await toggleTask(task.id)
    }
    setShowFeedbackModal(false)
    setPendingComplete(null)
    setFeedbackText('')
    const nextCount = pomodoroCount + 1
    setPomodoroCount(nextCount)
    if (nextCount % POMODOROS_BEFORE_LONG_BREAK === 0) {
      startPhase('longBreak')
    } else {
      startPhase('shortBreak')
    }
  }, [pendingComplete, addPomodoroSession, tasks, toggleTask, pomodoroCount, startPhase])

  const confirmFeedback = useCallback(async () => {
    if (!pendingComplete) return
    const date = formatDate(new Date())
    await addPomodoroSession({
      date,
      completedAt: new Date().toISOString(),
      taskId: pendingComplete.taskId,
      taskTitle: pendingComplete.taskTitle,
      habitId: pendingComplete.habitId,
      durationMinutes: pendingComplete.durationMinutes,
      feedback: feedbackText.trim() || undefined,
    })
    if (pendingComplete.taskId) {
      const task = tasks.find((t) => t.id === pendingComplete.taskId)
      if (task) await toggleTask(task.id)
    }
    setShowFeedbackModal(false)
    setPendingComplete(null)
    setFeedbackText('')
    const nextCount = pomodoroCount + 1
    setPomodoroCount(nextCount)
    if (nextCount % POMODOROS_BEFORE_LONG_BREAK === 0) {
      startPhase('longBreak')
    } else {
      startPhase('shortBreak')
    }
  }, [pendingComplete, feedbackText, addPomodoroSession, tasks, toggleTask, pomodoroCount, startPhase])

  const handleCompleteRef = useRef(handleComplete)
  handleCompleteRef.current = handleComplete

  useEffect(() => {
    if (!isRunning || secondsLeft <= 0) return
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setTimeout(() => handleCompleteRef.current(), 0)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [isRunning, secondsLeft])

  const handleReset = () => {
    setIsRunning(false)
    setWorkStartTime(null)
    if (phase === 'work') {
      setSecondsLeft(workMinutes * 60)
    } else if (phase === 'shortBreak') {
      setSecondsLeft(shortBreakMinutes * 60)
    } else {
      setSecondsLeft(longBreakMinutes * 60)
    }
  }

  useEffect(() => {
    if (selectedHabitId && selectedAreaId) {
      const habit = habits.find((h) => h.id === selectedHabitId)
      if (habit && habit.areaId !== selectedAreaId) {
        setSelectedHabitId(null)
      }
    }
  }, [selectedAreaId, selectedHabitId, habits])

  useEffect(() => {
    if (isRunning) {
      setEditingWorkMin(false)
      setEditingShortBreak(false)
      setEditingLongBreak(false)
      setEditingTarget(false)
    }
  }, [isRunning])

  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) return
    await addTask(newTaskTitle)
    setNewTaskTitle('')
  }

  const canRequestNotification =
    'Notification' in window && (notificationPermission ?? Notification.permission) === 'default'
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      const perm = await Notification.requestPermission()
      setNotificationPermission(perm)
    }
  }, [])

  useEffect(() => {
    if (!showAreaDropdown && !showHabitDropdown) return
    const handleClick = (e: MouseEvent) => {
      if (sectionRef.current && !sectionRef.current.contains(e.target as Node)) {
        setShowAreaDropdown(false)
        setShowHabitDropdown(false)
      }
    }
    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [showAreaDropdown, showHabitDropdown])

  useEffect(() => {
    if (!showFeedbackModal) return
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        skipFeedbackAndContinue()
      }
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [showFeedbackModal, skipFeedbackAndContinue])

  const EditableTimeBtn = ({
    value,
    editing,
    setEditing,
    editValue,
    setEditValue,
    min,
    max,
    onSave,
    label,
    disabled,
  }: {
    value: number
    editing: boolean
    setEditing: (v: boolean) => void
    editValue: string
    setEditValue: (v: string) => void
    min: number
    max: number
    onSave: (v: number) => void
    label: string
    disabled: boolean
  }) => (
    <div className="pomodoro-editable-row">
      <span className="pomodoro-editable-label">{label}</span>
      {editing ? (
        <input
          type="number"
          min={min}
          max={max}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={() => {
            const v = Math.max(min, Math.min(max, +editValue || min))
            onSave(v)
            setEditValue(String(v))
            setEditing(false)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              const v = Math.max(min, Math.min(max, +editValue || min))
              onSave(v)
              setEditValue(String(v))
              setEditing(false)
              ;(e.target as HTMLInputElement).blur()
            }
          }}
          onFocus={(e) => e.target.select()}
          autoFocus
          className="pomodoro-input"
        />
      ) : (
        <button
          type="button"
          onClick={() => {
            if (!disabled) {
              setEditValue(String(value))
              setEditing(true)
            }
          }}
          disabled={disabled}
          className="pomodoro-editable-btn"
          title={disabled ? 'Pause o timer para editar' : `Editar ${label.toLowerCase()}`}
        >
          {value} min <Pencil size={12} />
        </button>
      )}
    </div>
  )

  return (
    <section ref={sectionRef} className="pomodoro-section">
      {/* Header */}
      <header className="pomodoro-header">
        <div className="pomodoro-header-title">
          <div className="pomodoro-header-icon">
            <Flower2 size={22} strokeWidth={2} />
          </div>
          <h2>Pomodoro</h2>
        </div>
        {pomodoroCount > 0 && (
          <div className="pomodoro-badge">
            <Target size={14} />
            <span>{pomodoroCount}/{targetPomodoros}</span>
          </div>
        )}
      </header>

      {/* Hero: Timer + Circular Progress */}
      <div className="pomodoro-hero">
        <div
          className="pomodoro-timer-ring"
          style={{
            ['--phase-accent' as string]: config.accent,
            ['--phase-ring' as string]: config.ringColor,
            ['--progress' as string]: `${progressInPhase}%`,
          }}
        >
          <div className="pomodoro-timer-inner">
            <motion.span
              key={formatTime(secondsLeft)}
              initial={{ scale: 0.95, opacity: 0.8 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="pomodoro-time-display"
            >
              {formatTime(secondsLeft)}
            </motion.span>
            <span className="pomodoro-phase-label">{config.label}</span>
          </div>
        </div>

        {/* Sunflower */}
        <div className="pomodoro-sunflower">
          <SunflowerAnimation progress={progressForSunflower} size={100} />
        </div>

        {/* Controls */}
        <div className="pomodoro-controls">
          <button
            type="button"
            className="pomodoro-btn-primary"
            onClick={() => setIsRunning(!isRunning)}
            aria-label={isRunning ? 'Pausar timer' : 'Iniciar timer'}
            style={{
              background: config.gradient,
              boxShadow: `0 4px 20px ${config.ringColor}`,
            }}
          >
            {isRunning ? <Pause size={22} /> : <Play size={22} />}
            {isRunning ? 'Pausar' : 'Iniciar'}
          </button>
          <button
            type="button"
            className="pomodoro-btn-secondary"
            onClick={handleReset}
            aria-label="Reiniciar"
          >
            <RotateCcw size={18} />
            Reiniciar
          </button>
        </div>

        {/* Phase chips */}
        <div className="pomodoro-phase-chips">
          {(['work', 'shortBreak', 'longBreak'] as Phase[]).map((p) => (
            <button
              key={p}
              type="button"
              className={`pomodoro-phase-chip ${phase === p ? 'active' : ''}`}
              onClick={() => startPhase(p)}
              aria-label={`Iniciar ${phaseConfig[p].label.toLowerCase()}`}
              style={
                phase === p
                  ? {
                      background: phaseConfig[p].accentSoft,
                      color: phaseConfig[p].accent,
                      borderColor: phaseConfig[p].accent,
                    }
                  : undefined
              }
            >
              {phaseConfig[p].label}
            </button>
          ))}
        </div>
      </div>

      {/* Context: Área + Hábito + Tarefa (compact) */}
      <div className="pomodoro-context">
        <div className="pomodoro-context-row">
          <div className="pomodoro-dropdown-wrap">
            <span className="pomodoro-context-label">Área</span>
            <button
              type="button"
              onClick={() => {
                setShowAreaDropdown(!showAreaDropdown)
                setShowHabitDropdown(false)
              }}
              className="pomodoro-dropdown-btn"
              aria-expanded={showAreaDropdown}
            >
              {selectedArea ? selectedArea.name : 'Selecionar'}
              <ChevronDown size={16} className="pomodoro-chevron" />
            </button>
            <AnimatePresence>
              {showAreaDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="pomodoro-dropdown-menu"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedAreaId(null)
                      setSelectedHabitId(null)
                      setShowAreaDropdown(false)
                    }}
                    className="pomodoro-dropdown-item"
                  >
                    Nenhuma
                  </button>
                  {areas.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={() => {
                        setSelectedAreaId(a.id)
                        setSelectedHabitId(null)
                        setShowAreaDropdown(false)
                      }}
                      className={`pomodoro-dropdown-item ${selectedAreaId === a.id ? 'selected' : ''}`}
                    >
                      {a.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          <div className="pomodoro-dropdown-wrap">
            <span className="pomodoro-context-label">Hábito</span>
            <button
              type="button"
              onClick={() => {
                setShowHabitDropdown(!showHabitDropdown)
                setShowAreaDropdown(false)
              }}
              className="pomodoro-dropdown-btn"
              aria-expanded={showHabitDropdown}
            >
              {selectedHabit ? selectedHabit.name : 'Selecionar'}
              <ChevronDown size={16} className="pomodoro-chevron" />
            </button>
            <AnimatePresence>
              {showHabitDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  className="pomodoro-dropdown-menu"
                >
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedHabitId(null)
                      setShowHabitDropdown(false)
                    }}
                    className="pomodoro-dropdown-item"
                  >
                    Nenhum
                  </button>
                  {habitsInArea.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onClick={() => {
                        setSelectedHabitId(h.id)
                        setShowHabitDropdown(false)
                      }}
                      className={`pomodoro-dropdown-item ${selectedHabitId === h.id ? 'selected' : ''}`}
                    >
                      {h.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Tasks */}
      <div className="pomodoro-tasks">
        <div className="pomodoro-tasks-header">
          <div className="pomodoro-tasks-header-left">
            <ListTodo size={18} />
            <span>Tarefas</span>
            {tasks.length > 0 && (
              <span className="pomodoro-tasks-count">
                {tasks.filter((t) => t.completed).length}/{tasks.length}
              </span>
            )}
          </div>
          {!selectedTaskId && activeTasks.length > 0 && (
            <span className="pomodoro-tasks-hint">Selecione para vincular</span>
          )}
        </div>

        {tasks.length > 0 && (
          <div className="pomodoro-tasks-progress-bar">
            <motion.div
              className="pomodoro-tasks-progress-fill"
              initial={false}
              animate={{
                width: `${tasks.length > 0 ? (tasks.filter((t) => t.completed).length / tasks.length) * 100 : 0}%`,
              }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
            />
          </div>
        )}

        <div className="pomodoro-tasks-input-row">
          <div className="pomodoro-task-input-wrap">
            <ClipboardList size={16} className="pomodoro-task-input-icon" />
            <input
              type="text"
              placeholder="Adicionar nova tarefa..."
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
              className="pomodoro-task-input"
            />
          </div>
          <button
            type="button"
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            className="pomodoro-add-task-btn"
            aria-label="Adicionar tarefa"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="pomodoro-tasks-list">
          <AnimatePresence mode="popLayout">
            {activeTasks.length === 0 ? (
              <motion.div
                key="empty"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="pomodoro-tasks-empty"
              >
                <div className="pomodoro-tasks-empty-icon">
                  <ClipboardList size={32} strokeWidth={1.5} />
                </div>
                <p className="pomodoro-tasks-empty-title">Nenhuma tarefa pendente</p>
                <p className="pomodoro-tasks-empty-sub">Adicione uma tarefa acima para começar a focar</p>
              </motion.div>
            ) : (
              activeTasks.map((t) => (
                <motion.div
                  key={t.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 40, scale: 0.9, transition: { duration: 0.3 } }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className={`pomodoro-task-item ${selectedTaskId === t.id ? 'selected' : ''}`}
                >
                  <button
                    type="button"
                    onClick={() => toggleTask(t.id)}
                    className="pomodoro-task-checkbox"
                    aria-label="Concluir tarefa"
                  >
                    <Circle size={20} className="pomodoro-task-checkbox-circle" />
                    <Check size={12} className="pomodoro-task-checkbox-check" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedTaskId(selectedTaskId === t.id ? null : t.id)}
                    className="pomodoro-task-item-btn"
                    aria-pressed={selectedTaskId === t.id}
                  >
                    <span className="pomodoro-task-title-text">{t.title}</span>
                    {selectedTaskId === t.id && (
                      <span className="pomodoro-task-linked-dot" />
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => removeTask(t.id)}
                    className="pomodoro-task-action pomodoro-task-action-remove"
                    aria-label="Remover"
                  >
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Collapsible Settings */}
      <div className="pomodoro-settings-toggle">
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="pomodoro-settings-toggle-btn"
        >
          <Settings2 size={18} />
          <span>Configurações</span>
          <ChevronRight
            size={18}
            className={`pomodoro-settings-chevron ${showSettings ? 'open' : ''}`}
          />
        </button>
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeInOut' }}
              className="pomodoro-settings-panel"
            >
              <div className="pomodoro-settings-grid">
                <div className="pomodoro-settings-group">
                  <div className="pomodoro-settings-group-title">
                    <Clock size={16} />
                    Tempos
                  </div>
                  <EditableTimeBtn
                    value={workMinutes}
                    editing={editingWorkMin}
                    setEditing={setEditingWorkMin}
                    editValue={editWorkMinValue}
                    setEditValue={setEditWorkMinValue}
                    min={1}
                    max={60}
                    onSave={(v) => updateSettings({ workMinutes: v })}
                    label="Foco"
                    disabled={isRunning}
                  />
                  <EditableTimeBtn
                    value={shortBreakMinutes}
                    editing={editingShortBreak}
                    setEditing={setEditingShortBreak}
                    editValue={editShortBreakValue}
                    setEditValue={setEditShortBreakValue}
                    min={1}
                    max={30}
                    onSave={(v) => updateSettings({ shortBreakMinutes: v })}
                    label="Pausa curta"
                    disabled={isRunning}
                  />
                  <EditableTimeBtn
                    value={longBreakMinutes}
                    editing={editingLongBreak}
                    setEditing={setEditingLongBreak}
                    editValue={editLongBreakValue}
                    setEditValue={setEditLongBreakValue}
                    min={1}
                    max={60}
                    onSave={(v) => updateSettings({ longBreakMinutes: v })}
                    label="Pausa longa"
                    disabled={isRunning}
                  />
                </div>
                <div className="pomodoro-settings-group">
                  <div className="pomodoro-settings-group-title">
                    <Target size={16} />
                    Meta
                  </div>
                  <div className="pomodoro-editable-row">
                    <span className="pomodoro-editable-label">Pomodoros</span>
                    {editingTarget ? (
                      <input
                        type="number"
                        min={1}
                        max={12}
                        value={editTargetValue}
                        onChange={(e) => setEditTargetValue(e.target.value)}
                        onBlur={() => {
                          const v = Math.max(1, Math.min(12, +editTargetValue || 1))
                          updateSettings({ targetPomodoros: v })
                          setEditTargetValue(String(v))
                          setEditingTarget(false)
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            const v = Math.max(1, Math.min(12, +editTargetValue || 1))
                            updateSettings({ targetPomodoros: v })
                            setEditTargetValue(String(v))
                            setEditingTarget(false)
                            ;(e.target as HTMLInputElement).blur()
                          }
                        }}
                        onFocus={(e) => e.target.select()}
                        autoFocus
                        className="pomodoro-input"
                      />
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          if (!isRunning) {
                            setEditTargetValue(String(targetPomodoros))
                            setEditingTarget(true)
                          }
                        }}
                        disabled={isRunning}
                        className="pomodoro-editable-btn"
                      >
                        {targetPomodoros} <Pencil size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer actions */}
      <div className="pomodoro-footer">
        {canRequestNotification && (
          <button
            type="button"
            onClick={requestNotificationPermission}
            className="pomodoro-notification-btn"
          >
            Ativar notificações ao concluir
          </button>
        )}
        <button
          type="button"
          onClick={() => setShowStorageArea(!showStorageArea)}
          className="pomodoro-history-btn"
        >
          <FileText size={18} />
          <span>{showStorageArea ? 'Ocultar histórico' : 'Ver histórico'}</span>
          <span className={`pomodoro-history-chevron ${showStorageArea ? 'open' : ''}`}>
            <ChevronRight size={18} />
          </span>
        </button>
      </div>

      {/* Storage area */}
      <AnimatePresence>
        {showStorageArea && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="pomodoro-storage"
          >
            <h3>Histórico de sessões</h3>
            <div className="pomodoro-storage-list">
              {sessions.length === 0 ? (
                <div className="pomodoro-storage-empty">Nenhuma sessão registrada.</div>
              ) : (
                sessions.map((s) => (
                  <div key={s.id} className="pomodoro-session-card">
                    <div className="pomodoro-session-title">
                      {s.taskTitle || 'Tarefa sem nome'} • {s.durationMinutes} min
                    </div>
                    <div className="pomodoro-session-date">
                      {new Date(s.completedAt).toLocaleString('pt-BR')}
                    </div>
                    {s.feedback && (
                      <div className="pomodoro-session-feedback">"{s.feedback}"</div>
                    )}
                  </div>
                ))
              )}
            </div>
            <h3>Tarefas concluídas</h3>
            <div className="pomodoro-storage-list">
              {tasks.filter((t) => t.completed).length === 0 ? (
                <div className="pomodoro-storage-empty">Nenhuma tarefa concluída.</div>
              ) : (
                tasks
                  .filter((t) => t.completed)
                  .map((t) => (
                    <div key={t.id} className="pomodoro-completed-task">
                      <Check size={16} />
                      {t.title}
                    </div>
                  ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Modal */}
      <AnimatePresence>
        {showFeedbackModal && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pomodoro-feedback-title"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pomodoro-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="pomodoro-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pomodoro-modal-icon">✓</div>
              <h3 id="pomodoro-feedback-title">Pomodoro concluído!</h3>
              <p id="pomodoro-feedback-desc">
                Adicione notas de feedback (opcional). Pressione Esc para pular.
              </p>
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="O que você fez? Como foi?"
                rows={4}
                className="pomodoro-modal-textarea"
              />
              <div className="pomodoro-modal-actions">
                <button
                  type="button"
                  onClick={skipFeedbackAndContinue}
                  className="pomodoro-modal-btn-secondary"
                >
                  Pular
                </button>
                <button
                  type="button"
                  onClick={confirmFeedback}
                  className="pomodoro-modal-btn-primary"
                >
                  Salvar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
