import { useEffect, useState } from 'react'
import { prefersReducedMotion, useInView } from '../lib/hooks'

/** 进入视口后从 0 数到目标值。用不可见的终值占位，数字跳动时宽度不抖 */
export function CountUp({ to, duration = 1800 }: { to: number; duration?: number }) {
  const [ref, inView] = useInView<HTMLSpanElement>()
  const [value, setValue] = useState(0)

  useEffect(() => {
    if (!inView) return
    if (prefersReducedMotion()) {
      setValue(to)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setValue(Math.round(to * (1 - (1 - p) ** 4)))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, to, duration])

  return (
    <span ref={ref} className="inline-grid">
      <span className="invisible col-start-1 row-start-1" aria-hidden="true">
        {to}
      </span>
      <span className="col-start-1 row-start-1 text-right" aria-hidden="true">
        {value}
      </span>
      <span className="sr-only">{to}</span>
    </span>
  )
}
