'use client'

import {useCallback, useEffect, useState} from 'react'

/** Multi-card carousel that loops forward seamlessly via cloned slides. */
export function useInfiniteCarousel(
  itemCount: number,
  visibleCount: number,
  intervalMs: number,
) {
  const canNavigate = itemCount > visibleCount
  const [index, setIndex] = useState(0)
  const [transitionOn, setTransitionOn] = useState(true)

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
    if (!canNavigate) return
    const id = window.setInterval(goNext, intervalMs)
    return () => window.clearInterval(id)
  }, [canNavigate, goNext, intervalMs, index])

  const goTo = useCallback((i: number) => {
    setTransitionOn(true)
    setIndex(i)
  }, [])

  return {
    index,
    activeDot: index >= itemCount ? 0 : index,
    canNavigate,
    transitionOn,
    goNext,
    goPrev,
    goTo,
    onTransitionEnd,
    /** Extra clones at the end so the last → first step can animate. */
    cloneCount: canNavigate ? visibleCount : 0,
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
