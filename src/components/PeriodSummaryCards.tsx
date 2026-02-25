import { motion } from 'framer-motion'
import { TrendingUp, Target, Flame } from 'lucide-react'
import { formatDateDisplay } from '../utils/dateUtils'
import type { DateRange } from './DateCalendar'

interface PeriodSummaryCardsProps {
  dateRange: DateRange
  totalCompleted: number
  totalPossible: number
  percent: number
  topHabit?: { name: string; percent: number }
}

export function PeriodSummaryCards({
  dateRange,
  totalCompleted,
  totalPossible,
  percent,
  topHabit,
}: PeriodSummaryCardsProps) {
  const daysCount = Math.ceil(
    (dateRange.end.getTime() - dateRange.start.getTime()) / (1000 * 60 * 60 * 24)
  ) + 1
  const isSingleDay = dateRange.start.getTime() === dateRange.end.getTime()
  const periodLabel = isSingleDay
    ? formatDateDisplay(dateRange.start)
    : `${formatDateDisplay(dateRange.start)} – ${formatDateDisplay(dateRange.end)}`

  const cards = [
    {
      icon: Target,
      label: 'Hábitos completados',
      value: `${totalCompleted} / ${totalPossible}`,
      sub: daysCount === 1 ? '1 dia' : `${daysCount} dias`,
    },
    {
      icon: TrendingUp,
      label: 'Progresso',
      value: `${Math.round(percent)}%`,
      sub: 'do período',
    },
    ...(topHabit
      ? [
          {
            icon: Flame,
            label: 'Melhor hábito',
            value: topHabit.name,
            sub: `${Math.round(topHabit.percent)}%`,
          },
        ]
      : []),
  ]

  return (
    <section style={{ margin: '12px 16px' }}>
      <h2
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: 'var(--text-secondary)',
          marginBottom: 10,
        }}
      >
        Resumo: {periodLabel}
      </h2>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: 10,
        }}
      >
        {cards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-lg)',
              padding: 12,
              border: '1px solid var(--border-subtle)',
              boxShadow: 'var(--shadow-card)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 6,
              }}
            >
              <card.icon size={18} color="var(--accent-red)" />
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--text-secondary)',
                  fontWeight: 500,
                }}
              >
                {card.label}
              </span>
            </div>
            <div
              style={{
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text-primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {card.value}
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-secondary)',
                marginTop: 2,
              }}
            >
              {card.sub}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
