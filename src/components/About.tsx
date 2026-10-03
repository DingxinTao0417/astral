import { useRef } from 'react'
import { about, brand } from '../content/site'
import { gsap, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/hooks'
import { stage } from '../lib/stage'
import { ScrollReveal } from './bits/ScrollReveal'
import { Sparkle } from './Icons'
import { Img } from './Img'

/** 「关于」页的正文：拱形相框 + 自述 + 工具清单。第一段自述放在页头，这里从第二段开始 */
export function About() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    (_, contextSafe) => {
      if (!root.current || prefersReducedMotion()) return
      const q = gsap.utils.selector(root.current)
      const frame = q('[data-portrait]')[0]

      // 进场前的样子：相框从下往上被「揭开」，里面的照片略微放大
      gsap.set(frame, { clipPath: 'inset(100% 0% 0% 0%)' })
      gsap.set(q('[data-portrait-img]'), { scale: 1.3 })
      gsap.set(q('[data-portrait-note]'), { autoAlpha: 0, y: 16 })
      gsap.set(q('[data-badge]'), { autoAlpha: 0, scale: 0.4, rotate: -120 })
      gsap.set(q('[data-kit]'), { autoAlpha: 0, y: 30 })
      gsap.set(q('[data-kit-rule]'), { scaleX: 0 })

      // 照片在相框里比相框本身走得慢，圆形徽章跟着滚动多转一点
      gsap.fromTo(
        q('[data-portrait-drift]'),
        { yPercent: -5 },
        { yPercent: 5, ease: 'none', scrollTrigger: { trigger: frame, start: 'top bottom', end: 'bottom top', scrub: true } },
      )
      gsap.to(q('[data-badge-turn]'), {
        rotate: 300,
        ease: 'none',
        scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 1 },
      })

      return stage.whenOpen(
        contextSafe!(() => {
          gsap
            .timeline({ scrollTrigger: { trigger: frame, start: 'top 85%', once: true } })
            .to(frame, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'curtain' }, 0)
            .to(q('[data-portrait-img]'), { scale: 1, duration: 1.9 }, 0)
            .to(q('[data-badge]'), { autoAlpha: 1, scale: 1, rotate: 0, duration: 1.3, ease: 'back.out(1.6)' }, 0.7)
            .to(q('[data-portrait-note]'), { autoAlpha: 1, y: 0, duration: 0.9 }, 1)
          gsap
            .timeline({ scrollTrigger: { trigger: q('[data-kits]')[0], start: 'top 86%', once: true } })
            .to(q('[data-kit-rule]'), { scaleX: 1, duration: 1.3, ease: 'power3.inOut' }, 0)
            .to(q('[data-kit]'), { autoAlpha: 1, y: 0, duration: 1, stagger: 0.12 }, 0.15)
        }),
      )
    },
    { scope: root },
  )

  return (
    <section ref={root} className="mx-auto max-w-6xl px-5 pb-16 md:pb-24">
      <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <div className="relative mx-auto w-[min(76vw,340px)] lg:sticky lg:top-28 lg:w-full lg:max-w-100">
          {/* 拱形相框：外层镭射描边，内层照片 */}
          <div
            data-portrait
            className="rounded-b-[2rem] rounded-t-full bg-[conic-gradient(from_140deg,#ffa3d5,#cdb5ff,#9be8ff,#ffe6f4,#ff78bf,#ad8cff,#ffd9c2,#ffa3d5)] p-[2px] shadow-[0_50px_120px_-45px_rgb(255_79_168/0.7)]"
          >
            <div className="overflow-hidden rounded-b-[calc(2rem-2px)] rounded-t-full bg-night-800">
              <div data-portrait-drift className="-my-[7%]">
                <Img
                  data-portrait-img
                  id={about.portrait}
                  alt={`${brand.owner}的人像照片`}
                  sizes="(min-width: 1024px) 400px, 76vw"
                  className="aspect-3/4 w-full object-cover object-[50%_30%]"
                />
              </div>
            </div>
          </div>
          <Badge />
          <p
            data-portrait-note
            className="mt-4 flex items-center justify-center gap-2 text-xs tracking-[0.1em] text-mist-300"
          >
            <Sparkle className="size-2.5 text-blush-400" />
            {about.portraitNote}
          </p>
        </div>

        <div>
          {/* 自述：跟着滚动一个词一个词地「读」出来 */}
          <div className="space-y-6 text-pretty text-lg leading-9 text-mist-100 md:text-[1.6rem] md:leading-[1.8]">
            {about.paragraphs.slice(1).map((text) => (
              <ScrollReveal key={text}>{text}</ScrollReveal>
            ))}
          </div>

          <dl data-kits className="relative mt-12 space-y-7 pt-9">
            <span data-kit-rule aria-hidden="true" className="absolute inset-x-0 top-0 h-px origin-left bg-white/12" />
            {about.kits.map((kit) => (
              <div key={kit.title} data-kit className="grid gap-3 sm:grid-cols-[7rem_1fr] sm:gap-4">
                <dt className="pt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-mist-400">{kit.title}</dt>
                <dd className="flex flex-wrap gap-2">
                  {kit.items.map((name) => (
                    <span key={name} className="chip">
                      {name}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  )
}

/** 相框角上缓慢旋转的圆形徽章 */
function Badge() {
  const text = `${brand.name} · Nova Lab · `.toUpperCase().repeat(2)
  return (
    <div data-badge aria-hidden="true" className="absolute -right-5 top-[58%] size-28 md:-right-8 md:size-32">
      <div
        data-badge-turn
        className="grid size-full place-items-center rounded-full border border-white/15 bg-night-900/75 backdrop-blur-md"
      >
        <svg viewBox="0 0 120 120" className="animate-spin-slow absolute inset-0 size-full">
          <defs>
            <path id="badge-circle" d="M60 60m-45 0a45 45 0 1 1 90 0a45 45 0 1 1-90 0" />
          </defs>
          <text className="fill-mist-50 font-mono text-[8.5px]">
            <textPath href="#badge-circle" textLength="280" lengthAdjust="spacing">
              {text}
            </textPath>
          </text>
        </svg>
        <Sparkle className="size-7 text-blush-300" />
      </div>
    </div>
  )
}
