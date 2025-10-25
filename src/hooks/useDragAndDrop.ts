import { useState, useCallback, useRef } from 'react'

interface DragState {
  isDragging: boolean
  draggedIndex: number | null
  dragOverIndex: number | null
}

interface UseDragAndDropProps {
  onReorder: (fromIndex: number, toIndex: number) => void
  longPressDuration?: number
}

export function useDragAndDrop({ onReorder, longPressDuration = 500 }: UseDragAndDropProps) {
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedIndex: null,
    dragOverIndex: null,
  })

  const longPressTimer = useRef<NodeJS.Timeout | null>(null)
  const touchStartPos = useRef<{ x: number; y: number } | null>(null)

  // Clear long press timer
  const clearLongPressTimer = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
      longPressTimer.current = null
    }
  }, [])

  // Handle touch start - initiate long press detection
  const handleTouchStart = useCallback((index: number, e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStartPos.current = { x: touch.clientX, y: touch.clientY }

    longPressTimer.current = setTimeout(() => {
      setDragState({
        isDragging: true,
        draggedIndex: index,
        dragOverIndex: null,
      })
    }, longPressDuration)
  }, [longPressDuration])

  // Handle touch move - detect if user moved finger (cancel long press)
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartPos.current) return

    const touch = e.touches[0]
    const deltaX = Math.abs(touch.clientX - touchStartPos.current.x)
    const deltaY = Math.abs(touch.clientY - touchStartPos.current.y)

    // If moved more than 10px, cancel long press
    if (deltaX > 10 || deltaY > 10) {
      clearLongPressTimer()
    }

    // If dragging, update drag over index
    if (dragState.isDragging) {
      const element = document.elementFromPoint(touch.clientX, touch.clientY)
      const accordionItem = element?.closest('[data-drag-index]')
      if (accordionItem) {
        const index = parseInt(accordionItem.getAttribute('data-drag-index') || '-1')
        if (index !== -1 && index !== dragState.dragOverIndex) {
          setDragState(prev => ({ ...prev, dragOverIndex: index }))
        }
      }
    }
  }, [dragState.isDragging, dragState.dragOverIndex, clearLongPressTimer])

  // Handle touch end - complete drag or cancel
  const handleTouchEnd = useCallback(() => {
    clearLongPressTimer()
    touchStartPos.current = null

    if (dragState.isDragging && dragState.draggedIndex !== null && dragState.dragOverIndex !== null) {
      if (dragState.draggedIndex !== dragState.dragOverIndex) {
        onReorder(dragState.draggedIndex, dragState.dragOverIndex)
      }
    }

    setDragState({
      isDragging: false,
      draggedIndex: null,
      dragOverIndex: null,
    })
  }, [dragState, onReorder, clearLongPressTimer])

  // Cancel drag on any tap
  const handleTap = useCallback(() => {
    if (dragState.isDragging) {
      setDragState({
        isDragging: false,
        draggedIndex: null,
        dragOverIndex: null,
      })
      clearLongPressTimer()
    }
  }, [dragState.isDragging, clearLongPressTimer])

  return {
    dragState,
    handleTouchStart,
    handleTouchMove,
    handleTouchEnd,
    handleTap,
  }
}
