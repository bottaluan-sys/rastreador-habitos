import type { RefObject } from 'react'
import { useDragToScroll } from '../hooks/useDragToScroll'

interface HabitGridScrollProps {
  children: React.ReactNode
  scrollRef?: RefObject<HTMLDivElement | null>
}

export function HabitGridScroll({ children, scrollRef }: HabitGridScrollProps) {
  const dragProps = useDragToScroll<HTMLDivElement>(scrollRef)

  return (
    <div
      ref={dragProps.ref as React.RefObject<HTMLDivElement>}
      className="habit-grid-scroll"
      style={{ overflowX: 'auto', ...dragProps.style }}
      onMouseDown={dragProps.onMouseDown}
      onTouchStart={dragProps.onTouchStart}
    >
      {children}
    </div>
  )
}
