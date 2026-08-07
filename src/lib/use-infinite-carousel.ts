'use client'

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type RefObject,
} from 'react'

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
 * Trackpad two-finger swipe (horizontal wheel) — the Mac gesture.
 * Leaves mostly-vertical page scrolling alone.
 */
export function useCarouselTrackpad({
  enabled,
  viewportRef,
  onPrev,
  onNext,
  pause,
  resume,
  /** Wheel delta needed before advancing one slide (higher = slower). */
  threshold = 90,
  /** Scales trackpad delta so flicks feel calmer. */
  sensitivity = 0.35,
  /** Ignore further wheel advances after a step (ms). */
  stepCooldownMs = 420,
}: {
  enabled: boolean
  viewportRef: RefObject<HTMLElement | null>
  onPrev: () => void
  onNext: () => void
  pause?: () => void
  resume?: () => void
  threshold?: number
  sensitivity?: number
  stepCooldownMs?: number
}) {
  const onPrevRef = useRef(onPrev)
  const onNextRef = useRef(onNext)
  const pauseRef = useRef(pause)
  const resumeRef = useRef(resume)
  onPrevRef.current = onPrev
  onNextRef.current = onNext
  pauseRef.current = pause
  resumeRef.current = resume

  useEffect(() => {
    const el = viewportRef.current
    if (!el || !enabled) return

    let acc = 0
    let resumeTimer = 0
    let coolUntil = 0

    const onWheel = (event: WheelEvent) => {
      const absX = Math.abs(event.deltaX)
      const absY = Math.abs(event.deltaY)
      const horizontal = absX > absY || (event.shiftKey && absY > 0)
      if (!horizontal) return

      const delta = absX > absY ? event.deltaX : event.deltaY
      if (Math.abs(delta) < 0.5) return

      event.preventDefault()
      pauseRef.current?.()
      window.clearTimeout(resumeTimer)
      resumeTimer = window.setTimeout(() => resumeRef.current?.(), 900)

      const now = performance.now()
      if (now < coolUntil) {
        acc = 0
        return
      }

      acc += delta * sensitivity
      if (acc >= threshold) {
        onNextRef.current()
        acc = 0
        coolUntil = now + stepCooldownMs
      } else if (acc <= -threshold) {
        onPrevRef.current()
        acc = 0
        coolUntil = now + stepCooldownMs
      }
    }

    el.addEventListener('wheel', onWheel, {passive: false})
    return () => {
      el.removeEventListener('wheel', onWheel)
      window.clearTimeout(resumeTimer)
    }
  }, [enabled, sensitivity, stepCooldownMs, threshold, viewportRef])
}

/**
 * Grab-hand mouse drag: open hand on hover, grabbing hand while dragging.
 */
export function useCarouselGrab({
  enabled,
  onPrev,
  onNext,
  pause,
  resume,
  threshold = 72,
}: {
  enabled: boolean
  onPrev: () => void
  onNext: () => void
  pause?: () => void
  resume?: () => void
  threshold?: number
}) {
  const [dragX, setDragX] = useState(0)
  const [grabbing, setGrabbing] = useState(false)
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
      setGrabbing(false)
      resume?.()
    },
    [onNext, onPrev, resume, threshold],
  )

  const onPointerDown = useCallback(
    (event: ReactPointerEvent<HTMLElement>) => {
      if (!enabled || event.button !== 0) return
      // Don't steal clicks from arrows / dots outside the track
      pointerIdRef.current = event.pointerId
      startXRef.current = event.clientX
      startYRef.current = event.clientY
      dragXRef.current = 0
      axisRef.current = null
      movedRef.current = false
      suppressClickRef.current = false
      setGrabbing(true)
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

  const onClickCapture = useCallback(
    (event: {preventDefault: () => void; stopPropagation: () => void}) => {
      if (!suppressClickRef.current) return
      event.preventDefault()
      event.stopPropagation()
      suppressClickRef.current = false
    },
    [],
  )

  return {
    dragX,
    grabbing,
    grabHandlers: {
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
