import { useEffect, useRef, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { gsap } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/hooks'

interface VelocityMarqueeProps {
  /** 一组内容，会被复制几份首尾相接 */
  children: ReactNode
  /** 平时的滚动速度，像素 / 秒。负数表示反方向 */
  speed?: number
  /** 页面滚得越快，字幕额外加速多少倍（每 1000 像素/秒） */
  boost?: number
  /** 跟着滚动速度倾斜的最大角度，0 表示不倾斜 */
  skew?: number
  copies?: number
  className?: string
}

/**
 * 跟着页面滚动速度变化的无限字幕：平时匀速走，页面滚得越快它越快，往回滚就倒着走。
 *
 * 思路来自 React Bits（reactbits.dev）的 ScrollVelocity。原版依赖 motion（framer-motion），
 * 这里用全站已经在用的 GSAP 时钟重写了一遍，不多引入一个动画库；
 * 另外加了「滚动时文字跟着倾斜」，并且滚出屏幕时自动停下。
 */
export function VelocityMarquee({
  children,
  speed = 60,
  boost = 4,
  skew = 0,
  copies = 4,
  className,
}: VelocityMarqueeProps) {
  const root = useRef<HTMLDivElement>(null)
  const track = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = root.current
    const strip = track.current
    const first = strip?.firstElementChild as HTMLElement | null
    if (!el || !strip || !first || prefersReducedMotion()) return

    let width = first.offsetWidth
    let x = 0
    let direction = 1
    let lastScroll = window.scrollY
    let velocity = 0
    let onScreen = false

    const tick = (_time: number, deltaMs: number) => {
      const dt = Math.min(deltaMs, 100) / 1000
      if (dt <= 0) return
      const scroll = window.scrollY
      const raw = (scroll - lastScroll) / dt
      lastScroll = scroll
      // 滚动速度做一点平滑，免得字幕一顿一顿
      velocity += (raw - velocity) * Math.min(1, dt * 7)
      if (!onScreen || !width) return

      if (velocity > 30) direction = 1
      else if (velocity < -30) direction = -1
      const factor = 1 + Math.min((Math.abs(velocity) / 1000) * boost, 14)
      x -= direction * speed * factor * dt
      x = ((x % width) - width) % width
      const tilt = skew ? gsap.utils.clamp(-skew, skew, (velocity / 1000) * -skew) : 0
      strip.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0) skewX(${tilt.toFixed(2)}deg)`
    }

    const resizer = new ResizeObserver(() => {
      width = first.offsetWidth
    })
    resizer.observe(first)
    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
    })
    visibility.observe(el)
    gsap.ticker.add(tick)

    return () => {
      gsap.ticker.remove(tick)
      resizer.disconnect()
      visibility.disconnect()
    }
  }, [speed, boost, skew])

  return (
    <div ref={root} className={cx('overflow-hidden', className)}>
      <div ref={track} className="flex w-max will-change-transform">
        {Array.from({ length: copies }, (_, i) => (
          <div key={i} aria-hidden={i > 0} className="flex shrink-0">
            {children}
          </div>
        ))}
      </div>
    </div>
  )
}
