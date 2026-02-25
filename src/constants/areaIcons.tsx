import type { LucideIcon } from 'lucide-react'
import { Dumbbell, Brain, Sparkles, Wallet, LayoutGrid, Folder } from 'lucide-react'

const AREA_ICONS: Record<string, LucideIcon> = {
  Corpo: Dumbbell,
  Mente: Brain,
  Espírito: Sparkles,
  Financeiro: Wallet,
  Organização: LayoutGrid,
}

export function getAreaIcon(areaName: string): LucideIcon {
  return AREA_ICONS[areaName] ?? Folder
}
