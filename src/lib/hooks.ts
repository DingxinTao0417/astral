import { useEffect, useRef, useState, type PointerEvent } from 'react'

/** 元素进入视口后返回 true（只触发一次） */
export function useInView<T extends Element>(margin = '0px 0px -12% 0px') {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          io.disconnect()
        }
      },
      { rootMargin: margin, threshold: 0.08 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [margin])

  return [ref, inView] as const
}

export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** 把鼠标位置写进 --mx / --my，给 .spot 的柔光用 */
export function trackSpotlight(e: PointerEvent<HTMLElement>) {
  if (e.pointerType !== 'mouse') return
  const rect = e.currentTarget.getBoundingClientRect()
  e.currentTarget.style.setProperty('--mx', `${e.clientX - rect.left}px`)
  e.currentTarget.style.setProperty('--my', `${e.clientY - rect.top}px`)
}
