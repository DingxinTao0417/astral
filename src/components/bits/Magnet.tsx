import { useEffect, useRef, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { FINE_POINTER, gsap, matches } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/hooks'

interface MagnetProps {
  children: ReactNode
  /** 鼠标离元素边缘多少像素以内开始被吸 */
  padding?: number
  /** 跟随的比例：0.35 表示鼠标偏离中心 100px，元素跟过去 35px */
  strength?: number
  className?: string
}

/**
 * 磁吸：鼠标靠近时，里面的元素会被「吸」过去一点，移开后弹回原位。用在主要按钮上。
 *
 * 来自 React Bits（reactbits.dev）的 Magnet。原版每次鼠标移动都触发一次 React 重新渲染，
 * 这里改成用 GSAP 直接改位置，不经过 React；松开时带一点弹性。只在有鼠标的设备上生效。
 */
export function Magnet({ children, padding = 60, strength = 0.35, className }: MagnetProps) {
  const wrapper = useRef<HTMLSpanElement>(null)
  const inner = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const zone = wrapper.current
    const target = inner.current
    if (!zone || !target || !matches(FINE_POINTER) || prefersReducedMotion()) return

    let active = false

    const onMove = (e: MouseEvent) => {
      const rect = zone.getBoundingClientRect()
      const dx = e.clientX - (rect.left + rect.width / 2)
      const dy = e.clientY - (rect.top + rect.height / 2)
      const inside = Math.abs(dx) < rect.width / 2 + padding && Math.abs(dy) < rect.height / 2 + padding
      if (inside) {
        active = true
        gsap.to(target, { x: dx * strength, y: dy * strength, duration: 0.45, ease: 'power3.out', overwrite: true })
      } else if (active) {
        active = false
        gsap.to(target, { x: 0, y: 0, duration: 0.9, ease: 'elastic.out(1, 0.45)', overwrite: true })
      }
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    return () => {
      window.removeEventListener('mousemove', onMove)
      gsap.killTweensOf(target)
      gsap.set(target, { clearProps: 'transform' })
    }
  }, [padding, strength])

  return (
    <span ref={wrapper} className={cx('inline-block', className)}>
      <span ref={inner} className="inline-block will-change-transform">
        {children}
      </span>
    </span>
  )
}
