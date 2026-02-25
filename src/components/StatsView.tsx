import { useState } from 'react'
import { formatDate } from '../utils/dateUtils'
import { ProgressChart } from './ProgressChart'
import { WeeklyProgress } from './WeeklyProgress'
import { CalendarHeatmap } from './CalendarHeatmap'
import { HabitRankingChart } from './HabitRankingChart'
import { HabitDistributionChart } from './HabitDistributionChart'
import { DayOfWeekChart } from './DayOfWeekChart'
import { GoalGauge, getStoredGoal, setStoredGoal } from './GoalGauge'
import { HabitDetailChart } from './HabitDetailChart'
import { StreakCard } from './StreakCard'
import { CollapsibleSection } from './CollapsibleSection'
import type { Habit } from '../types'
import type {
  ChartDataPoint,
  HeatmapDataPoint,
  HabitRankingItem,
  HabitDistributionItem,
  DayOfWeekItem,
  WeekProgress,
} from '../hooks/useStats'

interface StatsViewProps {
  chartData: ChartDataPoint[]
  weeklyProgress: WeekProgress[]
  heatmapData: HeatmapDataPoint[]
  habitRanking: HabitRankingItem[]
  habitDistribution: HabitDistributionItem[]
  dayOfWeekData: DayOfWeekItem[]
  getHabitChartData: (habitId: string) => ChartDataPoint[]
  currentStreak: number
  longestStreak: number
  habits: Habit[]
}

export function StatsView({
  chartData,
  weeklyProgress,
  heatmapData,
  habitRanking,
  habitDistribution,
  dayOfWeekData,
  getHabitChartData,
  currentStreak,
  longestStreak,
  habits,
}: StatsViewProps) {
  const [goalPercent, setGoalPercentState] = useState(getStoredGoal)
  const [selectedHabitId, setSelectedHabitId] = useState<string | null>(null)

  const setGoalPercent = (p: number) => {
    setGoalPercentState(p)
    setStoredGoal(p)
  }

  const todayData = chartData.find((d) => d.day === formatDate(new Date()))
  const currentPercent = todayData?.percent ?? 0

  return (
    <>
      <StreakCard currentStreak={currentStreak} longestStreak={longestStreak} />
      <GoalGauge
        currentPercent={currentPercent}
        goalPercent={goalPercent}
        onGoalChange={setGoalPercent}
      />
      <CollapsibleSection title="Calendário de Atividade" defaultOpen={true}>
        <div style={{ marginTop: -8 }}>
          <CalendarHeatmap data={heatmapData} compact />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Progresso Geral" defaultOpen={true}>
        <div style={{ marginTop: -8 }}>
          <ProgressChart data={chartData} compact />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Ranking de Hábitos" defaultOpen={true}>
        <div style={{ marginTop: -8 }}>
          <HabitRankingChart data={habitRanking} compact />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Distribuição por Hábito" defaultOpen={false}>
        <div style={{ marginTop: -8 }}>
          <HabitDistributionChart data={habitDistribution} compact />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Performance por Dia da Semana" defaultOpen={false}>
        <div style={{ marginTop: -8 }}>
          <DayOfWeekChart data={dayOfWeekData} compact />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Progresso Semanal" defaultOpen={true}>
        <div style={{ marginTop: -8 }}>
          <WeeklyProgress weeks={weeklyProgress} compact />
        </div>
      </CollapsibleSection>
      <CollapsibleSection title="Evolução por Hábito" defaultOpen={false}>
        <div style={{ marginBottom: '12px' }}>
          <select
            value={selectedHabitId ?? ''}
            onChange={(e) => setSelectedHabitId(e.target.value || null)}
            style={{
              width: '100%',
              padding: '10px 12px',
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '8px',
              color: 'var(--text-primary)',
              fontSize: '14px',
            }}
          >
            <option value="">Selecione um hábito</option>
            {habits.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </div>
        {selectedHabitId && (
          <HabitDetailChart
            habitName={habits.find((h) => h.id === selectedHabitId)?.name ?? ''}
            data={getHabitChartData(selectedHabitId)}
            compact
          />
        )}
      </CollapsibleSection>
    </>
  )
}
