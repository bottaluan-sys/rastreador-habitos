import { useRef, useCallback, useEffect, RefObject } from 'react'

const DRAG_THRESHOLD = 5

export function useDragToScroll<T extends HTMLElement>(externalRef?: RefObject<T | null>) {
  const internalRef = useRef<T>(null)
  const ref = externalRef ?? internalRef
  const isDragging = useRef(false)
  const lastX = useRef(0)
  const hasMoved = useRef(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    isDragging.current = true
    hasMoved.current = false
    lastX.current = e.pageX
    el.style.cursor = 'grabbing'
    el.style.userSelect = 'none'
  }, [])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    const el = ref.current
    if (!el || !isDragging.current) return
    const delta = e.pageX - lastX.current
    if (Math.abs(delta) > DRAG_THRESHOLD) hasMoved.current = true
    e.preventDefault()
    lastX.current = e.pageX
    el.scrollLeft -= delta
  }, [])

  const handleMouseUp = useCallback(() => {
    const el = ref.current
    if (!el) return
    isDragging.current = false
    el.style.cursor = 'grab'
    el.style.userSelect = ''
  }, [])

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [handleMouseMove, handleMouseUp])

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const el = ref.current
    if (!el) return
    isDragging.current = true
    hasMoved.current = false
    lastX.current = e.touches[0].pageX
  }, [])

  const handleTouchMove = useCallback((e: TouchEvent) => {
    const el = ref.current
    if (!el || !isDragging.current) return
    const delta = e.touches[0].pageX - lastX.current
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      hasMoved.current = true
      e.preventDefault()
    }
    lastX.current = e.touches[0].pageX
    el.scrollLeft -= delta
  }, [])

  const handleTouchEnd = useCallback(() => {
    isDragging.current = false
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const touchMove = (e: TouchEvent) => handleTouchMove(e)
    const touchEnd = () => handleTouchEnd()
    el.addEventListener('touchmove', touchMove, { passive: false })
    document.addEventListener('touchend', touchEnd)
    return () => {
      el.removeEventListener('touchmove', touchMove)
      document.removeEventListener('touchend', touchEnd)
    }
  }, [handleTouchMove, handleTouchEnd])

  return {
    ref,
    onMouseDown: handleMouseDown,
    onTouchStart: handleTouchStart,
    style: { cursor: 'grab' as const },
  }
}
