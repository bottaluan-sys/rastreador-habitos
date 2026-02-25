import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useHabits } from './hooks/useHabits'
import { useAreas } from './hooks/useAreas'
import { useCompletions } from './hooks/useCompletions'
import { useStats } from './hooks/useStats'
import { formatDate, getDatesBetween } from './utils/dateUtils'
import { useStreaks } from './hooks/useStreaks'
import { Header } from './components/Header'
import { DateCalendar, type DateRange } from './components/DateCalendar'
import { ProgressChart } from './components/ProgressChart'
import { PeriodSummaryCards } from './components/PeriodSummaryCards'
import { HabitGrid } from './components/HabitGrid'
import { WeeklyProgress } from './components/WeeklyProgress'
import { AddHabitButton } from './components/AddHabitButton'
import { BottomNav } from './components/BottomNav'
import { StatsView } from './components/StatsView'
import { AlertsView } from './components/AlertsView'
import { ProfileView } from './components/ProfileView'
import { AreasManager } from './components/AreasManager'
import { AreaPage } from './components/AreaPage'
import { GridSettings } from './components/GridSettings'
import { PomodoroView } from './components/PomodoroView'
import { WimHofView } from './components/WimHofView'
import { SleepView } from './components/SleepView'
import type { GridSettings as GridSettingsType } from './components/HabitGrid'

const DEFAULT_HABITS_BY_AREA: { areaName: string; habits: string[] }[] = [
  { areaName: 'Corpo', habits: ['beber 4l de agua', 'cardio matinal', 'Treinar'] },
  { areaName: 'Mente', habits: ['Estudar', 'leitura'] },
  { areaName: 'Espírito', habits: ['meditar'] },
  { areaName: 'Financeiro', habits: [] },
  {
    areaName: 'Organização',
    habits: [
      'Arrumar a Cama',
      'Manter o quarto arrumado',
      'Manter a Louça Lavada',
      'Organização de Arquivos e Programas',
    ],
  },
]

const GRID_SETTINGS_KEY = 'habit-grid-settings'

function loadGridSettings(): GridSettingsType {
  try {
    const raw = localStorage.getItem(GRID_SETTINGS_KEY)
    if (!raw) return { visibleUntilDate: null, firstRowDate: 'today' }
    const parsed = JSON.parse(raw)
    return {
      visibleUntilDate: parsed.visibleUntilDate ? new Date(parsed.visibleUntilDate) : null,
      firstRowDate: parsed.firstRowDate === 'today' ? 'today' : new Date(parsed.firstRowDate),
    }
  } catch {
    return { visibleUntilDate: null, firstRowDate: 'today' }
  }
}

function saveGridSettings(s: GridSettingsType) {
  localStorage.setItem(
    GRID_SETTINGS_KEY,
    JSON.stringify({
      visibleUntilDate: s.visibleUntilDate?.toISOString() ?? null,
      firstRowDate: s.firstRowDate === 'today' ? 'today' : (s.firstRowDate as Date).toISOString(),
    })
  )
}

const DEFAULT_AREAS = [
  { name: 'Corpo', color: '#22c55e' },
  { name: 'Mente', color: '#3b82f6' },
  { name: 'Espírito', color: '#a855f7' },
  { name: 'Financeiro', color: '#eab308' },
  { name: 'Organização', color: '#06b6d4' },
]

function App() {
  const { habits, add, update: updateHabit, loading } = useHabits()
  const { areas, add: addArea, remove: removeArea, loading: areasLoading, refresh: refreshAreas } = useAreas()

  useEffect(() => {
    const seeded = localStorage.getItem('areas-seeded')
    if (!areasLoading && areas.length === 0 && !seeded) {
      localStorage.setItem('areas-seeded', '1')
      DEFAULT_AREAS.forEach((a) => addArea(a.name, a.color))
    }
  }, [areasLoading, areas.length, addArea])

  useEffect(() => {
    if (areasLoading) return
    const areaNames = new Set(areas.map((a) => a.name))
    const missing = DEFAULT_AREAS.filter((a) => !areaNames.has(a.name))
    if (missing.length > 0) {
      ;(async () => {
        for (const a of missing) {
          await addArea(a.name, a.color)
        }
        refreshAreas()
      })()
    }
  }, [areasLoading, areas, addArea, refreshAreas])

  useEffect(() => {
    if (
      loading ||
      habits.length > 0 ||
      areas.length < DEFAULT_AREAS.length ||
      areasLoading
    )
      return
    const seeded = localStorage.getItem('habits-seeded')
    if (!seeded) {
      localStorage.setItem('habits-seeded', '1')
      DEFAULT_HABITS_BY_AREA.forEach(({ areaName, habits: habitNames }) => {
        const area = areas.find((a) => a.name === areaName)
        habitNames.forEach((name) => add(name, area?.id))
      })
    }
  }, [loading, habits.length, areas, areasLoading, add])

  // Seed hábitos de Organização para usuários que já tinham o app (área nova)
  useEffect(() => {
    if (loading || areasLoading) return
    const orgSeeded = localStorage.getItem('habits-organizacao-seeded')
    if (orgSeeded) return
    const orgArea = areas.find((a) => a.name === 'Organização')
    if (!orgArea) return
    const orgHabits = habits.filter((h) => h.areaId === orgArea.id)
    if (orgHabits.length > 0) return
    localStorage.setItem('habits-organizacao-seeded', '1')
    const orgConfig = DEFAULT_HABITS_BY_AREA.find((c) => c.areaName === 'Organização')
    if (orgConfig) {
      orgConfig.habits.forEach((name) => add(name, orgArea.id))
    }
  }, [loading, areasLoading, areas, habits, add])
  const { isCompleted, toggleCompletion, completions } = useCompletions()
  const [selectedDate, setSelectedDate] = useState(() => new Date())
  const [dateRange, setDateRange] = useState<DateRange | null>(null)
  const {
    chartData,
    weeklyProgress,
    heatmapData,
    habitRanking,
    habitDistribution,
    dayOfWeekData,
    gain,
    areaProgress,
    getHabitProgress,
    getHabitChartData,
  } = useStats(habits, completions, areas, selectedDate, dateRange)
  const { currentStreak, longestStreak } = useStreaks(habits, completions)

  const [gridSettings, setGridSettings] = useState<GridSettingsType>(loadGridSettings)
  useEffect(() => {
    saveGridSettings(gridSettings)
  }, [gridSettings])

  const [navActive, setNavActive] = useState<
    'home' | 'pomodoro' | 'wimhof' | 'sleep' | 'stats' | 'tips' | 'alerts' | 'settings' | 'share' | 'profile' | 'area'
  >('home')
  const [selectedAreaId, setSelectedAreaId] = useState<string | null>(null)
  const [shareCopied, setShareCopied] = useState(false)

  const handleAreaNavigate = (areaId: string) => {
    setSelectedAreaId(areaId)
    setNavActive('area')
  }

  const handleAddHabit = (name: string, areaId?: string) => {
    add(name, areaId)
  }

  const handleRemoveArea = async (areaId: string) => {
    if (!confirm('Remover esta área? Os hábitos vinculados ficarão sem área.')) return
    const habitsInArea = habits.filter((h) => h.areaId === areaId)
    for (const h of habitsInArea) {
      await updateHabit({ ...h, areaId: undefined })
    }
    await removeArea(areaId)
  }

  const effectiveRange =
    dateRange && dateRange.start.getTime() !== dateRange.end.getTime()
      ? dateRange
      : null

  const displayRangeForCards: DateRange = effectiveRange ?? {
    start: selectedDate,
    end: selectedDate,
  }

  const totalCompletedInRange = completions.filter(
    (c) =>
      c.completed &&
      c.date >= formatDate(displayRangeForCards.start) &&
      c.date <= formatDate(displayRangeForCards.end)
  ).length

  const daysInRange = getDatesBetween(
    displayRangeForCards.start,
    displayRangeForCards.end
  ).length
  const totalPossibleInRange = habits.length * daysInRange

  const percentInRange =
    totalPossibleInRange > 0 ? (totalCompletedInRange / totalPossibleInRange) * 100 : 0

  const topHabitInRange = habits
    .map((h) => {
      const completed = completions.filter(
        (c) =>
          c.habitId === h.id &&
          c.completed &&
          c.date >= formatDate(displayRangeForCards.start) &&
          c.date <= formatDate(displayRangeForCards.end)
      ).length
      return {
        name: h.name,
        percent: daysInRange > 0 ? (completed / daysInRange) * 100 : 0,
      }
    })
    .sort((a, b) => b.percent - a.percent)[0]

  const mainContent = (
    <>
      <DateCalendar
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        dateRange={dateRange}
        onSelectRange={setDateRange}
      />
      <PeriodSummaryCards
        dateRange={displayRangeForCards}
        totalCompleted={totalCompletedInRange}
        totalPossible={totalPossibleInRange}
        percent={percentInRange}
        topHabit={topHabitInRange ?? undefined}
      />
      <ProgressChart data={chartData} />
      <AddHabitButton
        onAdd={handleAddHabit}
        areas={areas}
        onAddArea={(name) => addArea(name)}
      />
      <HabitGrid
        habits={habits}
        areas={areas}
        isCompleted={isCompleted}
        onToggle={toggleCompletion}
        getHabitProgress={getHabitProgress}
        onUpdateHabit={updateHabit}
        baseDate={selectedDate}
        dateRange={effectiveRange}
        gridSettings={gridSettings}
      />
      <WeeklyProgress weeks={weeklyProgress} />
    </>
  )

  const statsContent = (
    <StatsView
      chartData={chartData}
      weeklyProgress={weeklyProgress}
      heatmapData={heatmapData}
      habitRanking={habitRanking}
      habitDistribution={habitDistribution}
      dayOfWeekData={dayOfWeekData}
      getHabitChartData={getHabitChartData}
      currentStreak={currentStreak}
      longestStreak={longestStreak}
      habits={habits}
    />
  )

  const tipsContent = (
    <section
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        margin: '12px 16px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Dicas</h2>
      <ul style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.8 }}>
        <li>Marque os hábitos assim que completá-los.</li>
        <li>Mantenha uma rotina consistente.</li>
        <li>Comece com poucos hábitos e aumente gradualmente.</li>
      </ul>
    </section>
  )

  const pomodoroContent = <PomodoroView />
  const wimhofContent = <WimHofView />
  const sleepContent = <SleepView />
  const alertsContent = <AlertsView />
  const profileContent = (
    <ProfileView currentStreak={currentStreak} longestStreak={longestStreak} />
  )

  const settingsContent = (
    <>
      <section
        style={{
          background: 'var(--bg-card)',
          borderRadius: 'var(--radius-xl)',
          padding: '24px',
          margin: '12px 16px',
          border: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Configurações</h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
          Ajuste sua meta diária e lembretes nas abas Perfil e Alertas.
        </p>
      </section>
      <GridSettings value={gridSettings} onChange={setGridSettings} />
      <AreasManager areas={areas} onAdd={(name, color) => addArea(name, color)} onRemove={handleRemoveArea} />
    </>
  )

  const shareContent = (
    <section
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-xl)',
        padding: '24px',
        margin: '12px 16px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <h2 style={{ fontSize: '18px', marginBottom: '12px' }}>Compartilhar</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '14px', marginBottom: '16px' }}>
        Seu progresso: {gain} hábitos completados, streak de {currentStreak} dias!
      </p>
      <button
        onClick={async () => {
          const text = `Meu progresso no Rastreador de Hábitos: ${gain} hábitos completados, streak de ${currentStreak} dias!`
          try {
            if (navigator.clipboard) {
              await navigator.clipboard.writeText(text)
              setShareCopied(true)
              setTimeout(() => setShareCopied(false), 2000)
            }
          } catch {
            /* ignorar */
          }
        }}
        style={{
          padding: '10px 20px',
          background: shareCopied ? 'var(--accent-green)' : 'var(--accent-red)',
          color: 'white',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
        }}
      >
        {shareCopied ? 'Copiado!' : 'Copiar resumo'}
      </button>
    </section>
  )

  const selectedArea = areas.find((a) => a.id === selectedAreaId) ?? null

  const areaContent = selectedArea ? (
    <AreaPage
      area={selectedArea}
      habits={habits}
      completions={completions}
      isCompleted={isCompleted}
      onToggle={toggleCompletion}
      getHabitProgress={getHabitProgress}
      onUpdateHabit={updateHabit}
    />
  ) : (
    mainContent
  )

  const currentView =
    navActive === 'home'
      ? mainContent
      : navActive === 'area'
        ? areaContent
        : navActive === 'pomodoro'
          ? pomodoroContent
          : navActive === 'wimhof'
            ? wimhofContent
            : navActive === 'sleep'
              ? sleepContent
              : navActive === 'stats'
                ? statsContent
                : navActive === 'tips'
                  ? tipsContent
                  : navActive === 'alerts'
                    ? alertsContent
                    : navActive === 'profile'
                      ? profileContent
                      : navActive === 'settings'
                        ? settingsContent
                        : navActive === 'share'
                          ? shareContent
                          : mainContent

  return (
    <>
      <Header
        areaProgress={areaProgress}
        onSettingsClick={() => setNavActive('settings')}
      />
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={navActive === 'area' ? `area-${selectedAreaId}` : navActive}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
          >
            {currentView}
          </motion.div>
        </AnimatePresence>
      </main>
      <BottomNav
        active={navActive}
        selectedAreaId={selectedAreaId}
        onNavigate={setNavActive}
        onAreaNavigate={handleAreaNavigate}
        areas={areas}
      />
    </>
  )
}

export default App
