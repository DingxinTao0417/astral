import { useRef, type ReactNode } from 'react'
import { gsap, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/hooks'
import { stage } from '../lib/stage'

interface RevealProps {
  children: ReactNode
  className?: string
  /** 进场延迟，毫秒 */
  delay?: number
  /** 从下方多少像素的位置升上来 */
  y?: number
  /** 不是整块一起出现，而是里面的每个直接子元素依次出现 */
  stagger?: boolean
}

/** 滚动到视口时淡入上移。页面被开场或转场幕布盖着的时候先不动，幕布拉开再开始 */
export function Reveal({ children, className, delay = 0, y = 44, stagger = false }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useGSAP((_, contextSafe) => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    const targets = stagger ? [...el.children] : el
    gsap.set(targets, { autoAlpha: 0, y })
    return stage.whenOpen(
      contextSafe!(() => {
        gsap.to(targets, {
          autoAlpha: 1,
          y: 0,
          duration: 1.15,
          delay: delay / 1000,
          stagger: stagger ? 0.09 : 0,
          clearProps: 'transform,opacity,visibility',
          scrollTrigger: { trigger: el, start: 'top 90%', once: true },
        })
      }),
    )
  }, [])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}
