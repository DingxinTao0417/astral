import { useRef } from 'react'
import { stats } from '../content/site'
import { gsap, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/hooks'
import { stage } from '../lib/stage'
import { Sparkle } from './Icons'
import { Odometer } from './motion/Odometer'

/** 关键数据：不装框，大号数字直接排在夜空上。滚到这里时数字像里程表一样转出来 */
export function Stats() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    (_, contextSafe) => {
      if (!root.current || prefersReducedMotion()) return
      const q = gsap.utils.selector(root.current)
      gsap.set(q('[data-stat]'), { autoAlpha: 0, y: 44 })
      gsap.set(q('[data-rule]'), { scaleY: 0 })
      return stage.whenOpen(
        contextSafe!(() => {
          gsap
            .timeline({ scrollTrigger: { trigger: root.current, start: 'top 84%', once: true } })
            .to(q('[data-stat]'), { autoAlpha: 1, y: 0, duration: 1.15, stagger: 0.11 }, 0)
            .to(q('[data-rule]'), { scaleY: 1, duration: 1.3, ease: 'power3.inOut', stagger: 0.11 }, 0)
        }),
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-label="关键数据" className="mx-auto max-w-6xl px-5 py-16 md:py-28">
      <ul className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-0">
        {stats.map((s, i) => (
          <li key={s.label} className="relative md:pl-7 md:first:pl-0">
            {/* 列与列之间的竖线，进场时从上往下画出来 */}
            {i > 0 && (
              <span
                data-rule
                aria-hidden="true"
                className="absolute inset-y-0 left-0 hidden w-px origin-top bg-white/12 md:block"
              />
            )}
            <div data-stat>
              <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.24em] text-mist-500">
                <Sparkle className="size-2.5 text-blush-400" />0{i + 1}
              </p>
              <p className="mt-3 flex items-baseline font-display text-[clamp(4rem,8.6vw,6.75rem)]">
                <Odometer value={s.value} gradient="text-aurora" />
                <span className="ml-1.5 text-[0.32em] font-bold text-blush-200">{s.unit}</span>
              </p>
              <p className="mt-3 text-sm text-mist-300 md:text-[15px]">{s.label}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
