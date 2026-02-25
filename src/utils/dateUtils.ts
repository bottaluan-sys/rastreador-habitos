/** Formata data em YYYY-MM-DD usando o fuso local (evita bug de timezone). */
export function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7)
}

export function getWeeksRange(weeksBack: number = 4, baseDate?: Date): { start: Date; end: Date }[] {
  const today = baseDate ? new Date(baseDate) : new Date()
  const result: { start: Date; end: Date }[] = []

  for (let i = weeksBack - 1; i >= 0; i--) {
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - (today.getDay() || 7) + 1 - i * 7)
    weekStart.setHours(0, 0, 0, 0)

    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)

    result.push({ start: weekStart, end: weekEnd })
  }

  return result
}

/** Retorna semanas centradas na data base (hoje no meio: 2 antes + atual + 2 depois). */
export function getWeeksRangeCentered(
  weeksBefore: number = 2,
  weeksAfter: number = 2,
  baseDate?: Date
): { start: Date; end: Date }[] {
  const today = baseDate ? new Date(baseDate) : new Date()
  const result: { start: Date; end: Date }[] = []
  const dayNum = today.getDay() || 7 // 1 = Segunda, 7 = Domingo
  const mondayOfCurrentWeek = new Date(today)
  mondayOfCurrentWeek.setDate(today.getDate() - dayNum + 1)
  mondayOfCurrentWeek.setHours(0, 0, 0, 0)

  for (let i = -weeksBefore; i <= weeksAfter; i++) {
    const weekStart = new Date(mondayOfCurrentWeek)
    weekStart.setDate(mondayOfCurrentWeek.getDate() + i * 7)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    weekEnd.setHours(23, 59, 59, 999)
    result.push({ start: weekStart, end: weekEnd })
  }

  return result
}

export function getDaysInWeek(weekStart: Date): Date[] {
  const days: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    days.push(d)
  }
  return days
}

const DAY_NAMES = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']

export function getDayName(date: Date): string {
  return DAY_NAMES[date.getDay()]
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/** Retorna um array de datas entre start e end (inclusive). */
export function getDatesBetween(start: Date, end: Date): Date[] {
  const result: Date[] = []
  const s = new Date(start.getFullYear(), start.getMonth(), start.getDate())
  const e = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  const eTime = e.getTime()
  while (s.getTime() <= eTime) {
    result.push(new Date(s))
    s.setDate(s.getDate() + 1)
  }
  return result
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
]

export const MONTH_NAMES_SHORT = [
  'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
  'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
]

/** Retorna o nome do mês (abreviado ou completo). */
export function getMonthName(date: Date, short = false): string {
  const names = short ? MONTH_NAMES_SHORT : MONTH_NAMES
  return names[date.getMonth()]
}

/** Retorna semanas a partir de uma data âncora (primeira semana = semana que contém anchorDate). */
export function getWeeksFromAnchor(
  anchorDate: Date,
  numWeeks: number = 5
): { start: Date; end: Date }[] {
  const anchor = new Date(anchorDate)
  anchor.setHours(0, 0, 0, 0)
  const dayNum = anchor.getDay() || 7
  const mondayOfAnchorWeek = new Date(anchor)
  mondayOfAnchorWeek.setDate(anchor.getDate() - dayNum + 1)
  mondayOfAnchorWeek.setHours(0, 0, 0, 0)

  const result: { start: Date; end: Date }[] = []
  for (let i = 0; i < numWeeks; i++) {
    const start = new Date(mondayOfAnchorWeek)
    start.setDate(mondayOfAnchorWeek.getDate() + i * 7)
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    end.setHours(23, 59, 59, 999)
    result.push({ start, end })
  }
  return result
}

/** Formata data para exibição em pt-BR (ex: 23/02/2026). */
export function formatDateDisplay(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}
