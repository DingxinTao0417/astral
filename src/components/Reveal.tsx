import type { CSSProperties, ReactNode } from 'react'
import { cx } from '../lib/cx'
import { useInView } from '../lib/hooks'

interface RevealProps {
  children: ReactNode
  className?: string
  /** 进场延迟，毫秒 */
  delay?: number
}

/** 滚动到视口时淡入上移 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  const [ref, inView] = useInView<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={cx('reveal', inView && 'is-in', className)}
      style={{ '--d': `${delay}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}
