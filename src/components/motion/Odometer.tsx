import { useRef } from 'react'
import { cx } from '../../lib/cx'
import { gsap, useGSAP } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/hooks'
import { stage } from '../../lib/stage'

interface OdometerProps {
  /** 要显示的数字，可以带小数点，例如 461 或 '962.9' */
  value: number | string
  /** 每一位数字上的渐变字样式，例如 text-aurora。渐变会横跨整个数字，而不是每一位各来一遍 */
  gradient?: string
  className?: string
}

/** 每一位数字的滚轮要转过多少个数才停下：越靠右的位转得越多 */
const turns = (place: number) => 10 * (1 + place)

/**
 * 数字滚轮：进入视口时每一位像老式里程表一样从 0 滚到目标数字，右边的位转得久一些。
 * 平时（以及开了「减弱动态效果」时）直接停在最终数字上。
 */
export function Odometer({ value, gradient, className }: OdometerProps) {
  const root = useRef<HTMLSpanElement>(null)
  const chars = [...String(value)]

  useGSAP(
    (_, contextSafe) => {
      const el = root.current
      if (!el || prefersReducedMotion()) return
      const reels = gsap.utils.toArray<HTMLElement>('[data-reel]', el)
      // 先全部拨回 0，等进入视口再转
      gsap.set(reels, { y: 0, yPercent: 0 })
      return stage.whenOpen(
        contextSafe!(() => {
          gsap.to(reels, {
            yPercent: (i) => -100 * (1 - 1 / reels[i].childElementCount),
            duration: (i) => 1.9 + i * 0.35,
            ease: 'power4.out',
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: 'top 92%', once: true },
          })
        }),
      )
    },
    { scope: root },
  )

  let place = -1
  return (
    <span ref={root} className={cx('inline-flex leading-none', className)}>
      <span className="sr-only">{value}</span>
      {chars.map((char, i) => {
        const isDigit = /\d/.test(char)
        if (isDigit) place++
        // 这一位在整条渐变里取哪一段
        const slice = gradient
          ? {
              backgroundSize: `${chars.length * 100}% 100%`,
              backgroundPosition: `${chars.length > 1 ? (i / (chars.length - 1)) * 100 : 0}% 0`,
            }
          : undefined
        if (!isDigit) {
          return (
            <span key={i} aria-hidden="true" className={gradient} style={slice}>
              {char}
            </span>
          )
        }
        const target = Number(char)
        const length = turns(place) + target + 1
        return (
          // 窗口的宽度由里面那个看不见的最终数字撑开；上下用 clip-path 裁，不影响基线对齐
          <span key={i} aria-hidden="true" className="relative inline-block [clip-path:inset(0_-0.4em)]">
            <span className="invisible">{char}</span>
            <span
              data-reel
              className="absolute left-1/2 top-0 flex -translate-x-1/2 flex-col items-center will-change-transform"
              style={{ transform: `translateY(${-100 * (1 - 1 / length)}%)` }}
            >
              {Array.from({ length }, (_, n) => (
                <span key={n} className={cx('block h-[1em]', gradient)} style={slice}>
                  {n % 10}
                </span>
              ))}
            </span>
          </span>
        )
      })}
    </span>
  )
}
