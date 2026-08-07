'use client'

import {useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent} from 'react'

/** Multi-card carousel that loops forward seamlessly via cloned slides. */
export function useInfiniteCarousel(
  itemCount: number,
  visibleCount: number,
  intervalMs: number,
) {
  const canNavigate = itemCount > visibleCount
  const [index, setIndex] = useState(0)
  const [transitionOn, setTransitionOn] = useState(true)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    setIndex(0)
    setTransitionOn(true)
  }, [itemCount, visibleCount])

  const goNext = useCallback(() => {
    if (!canNavigate) return
    setTransitionOn(true)
    setIndex((i) => i + 1)
  }, [canNavigate])

  const goPrev = useCallback(() => {
    if (!canNavigate) return
    if (index === 0) {
      // Jump to the clone window, then step back one so prev feels continuous
      setTransitionOn(false)
      setIndex(itemCount)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setTransitionOn(true)
          setIndex(itemCount - 1)
        })
      })
      return
    }
    setTransitionOn(true)
    setIndex((i) => i - 1)
  }, [canNavigate, index, itemCount])

  const onTransitionEnd = useCallback(
    (event: {target: EventTarget | null; currentTarget: EventTarget | null}) => {
      // Ignore bubbled transitions from child elements (e.g. image hover)
      if (event.target !== event.currentTarget) return
      if (!canNavigate || index < itemCount) return
      setTransitionOn(false)
      setIndex(0)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setTransitionOn(true))
      })
    },
    [canNavigate, index, itemCount],
  )

  useEffect(() => {
    if (!canNavigate || paused) return
    const id = window.setInterval(goNext, intervalMs)
    return () => window.clearInterval(id)
  }, [canNavigate, goNext, intervalMs, index, paused])

  const goTo = useCallback((i: number) => {
    setTransitionOn(true)
    setIndex(i)
  }, [])

  const pause = useCallback(() => setPaused(true), [])
  const resume = useCallback(() => setPaused(false), [])

  return {
    index,
    activeDot: index >= itemCount ? 0 : index,
    canNavigate,
    transitionOn,
    goNext,
    goPrev,
    goTo,
    onTransitionEnd,
    pause,
    resume,
    /** Extra clones at the end so the last → first step can animate. */
    cloneCount: canNavigate ? visibleCount : 0,
  }
}

/**
 * Mouse / touch swipe for carousels. Tracks horizontally once intent is clear,
 * leaves vertical scrolling alone, and reports drag offset for live follow.
 */
export function useCarouselSwipe({
  enabled,
  onPrev,
  onNext,
  pause,
  resume,
  threshold = 48,
}: {
  enabled: boolean
  onPrev: () => void
  onNext: () => void
  pause?: () => void
  resume?: () => void
  threshold?: number
}) {
  const [dragX, setDragX] = useState(0)
  const [dragging, setDragging] = useState(false)
  const pointerIdRef = useRef<number | null>(null)
  const startXRef = useRef(0)
  const startYRef = useRef(0)
  const dragXRef = useRef(0)
  const axisRef = useRef<'x' | 'y' | null>(null)
  const movedRef = useRef(false)
  const suppressClickRef = useRef(false)

  const endDrag = useCallback(
    (commit: boolean) => {
      if (pointerIdRef.current == null) return
      const dx = dragXRef.current
      if (commit && movedRef.current) {
        if (dx <= -threshold) onNext()
        else if (dx >= threshold) onPrev()
      }
      if (movedRef.current) suppressClickRef.current = true
      pointerIdRef.current = null
      axisRef.current = null
      movedRef.current = false
      dragXRef.current = 0
      setDragX(0)
      setDragging(false)
      resume?.()
    },
    [onNext, onPrev, resume, threshold],
  )

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || event.button !== 0) return
      pointerIdRef.current = event.pointerId
      startXRef.current = event.clientX
      startYRef.current = event.clientY
      dragXRef.current = 0
      axisRef.current = null
      movedRef.current = false
      suppressClickRef.current = false
      setDragging(true)
      setDragX(0)
      pause?.()
      event.currentTarget.setPointerCapture(event.pointerId)
    },
    [enabled, pause],
  )

  const onPointerMove = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (pointerIdRef.current !== event.pointerId) return
      const dx = event.clientX - startXRef.current
      const dy = event.clientY - startYRef.current

      if (!axisRef.current) {
        if (Math.abs(dx) < 8 && Math.abs(dy) < 8) return
        axisRef.current = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'
        if (axisRef.current === 'y') {
          // Let the page scroll; abandon carousel drag.
          try {
            event.currentTarget.releasePointerCapture(event.pointerId)
          } catch {
            /* already released */
          }
          endDrag(false)
          return
        }
      }

      if (axisRef.current !== 'x') return
      event.preventDefault()
      movedRef.current = true
      dragXRef.current = dx
      setDragX(dx)
    },
    [endDrag],
  )

  const onPointerUp = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (pointerIdRef.current !== event.pointerId) return
      try {
        event.currentTarget.releasePointerCapture(event.pointerId)
      } catch {
        /* already released */
      }
      endDrag(true)
    },
    [endDrag],
  )

  const onPointerCancel = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (pointerIdRef.current !== event.pointerId) return
      endDrag(false)
    },
    [endDrag],
  )

  const onClickCapture = useCallback((event: {preventDefault: () => void; stopPropagation: () => void}) => {
    if (!suppressClickRef.current) return
    event.preventDefault()
    event.stopPropagation()
    suppressClickRef.current = false
  }, [])

  return {
    dragX,
    dragging,
    swipeHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture,
    },
  }
}

export function useCarouselVisibleCount() {
  const [visible, setVisible] = useState(1)

  useEffect(() => {
    const mqMd = window.matchMedia('(min-width: 768px)')
    const mqSm = window.matchMedia('(min-width: 640px)')

    const update = () => {
      if (mqMd.matches) setVisible(3)
      else if (mqSm.matches) setVisible(2)
      else setVisible(1)
    }

    update()
    mqMd.addEventListener('change', update)
    mqSm.addEventListener('change', update)
    return () => {
      mqMd.removeEventListener('change', update)
      mqSm.removeEventListener('change', update)
    }
  }, [])

  return visible
}
