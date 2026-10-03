import { useRef, type ReactNode } from 'react'
import { brand } from '../content/site'
import { gsap, SplitText, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/hooks'
import { stage } from '../lib/stage'
import { Aurora } from './Aurora'
import { Stars } from './Backdrop'
import { Sparkle } from './Icons'
import { Phrases } from './Phrases'

interface PageHeaderProps {
  index: string
  eyebrow: string
  title: string
  intro?: string
  /** 铺在极光和文字之间的一层，比如「影像」页跟着鼠标出现的照片 */
  children?: ReactNode
}

/** 子页面的页头：一条矮一些的极光 + 大标题。同时负责设置浏览器标签页标题 */
export function PageHeader({ index, eyebrow, title, intro, children }: PageHeaderProps) {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    (_, contextSafe) => {
      const el = root.current
      if (!el || prefersReducedMotion()) return
      const q = gsap.utils.selector(el)
      let alive = true
      let cancel = () => {}
      gsap.set(q('[data-ph-in]'), { autoAlpha: 0 })

      const build = contextSafe!(() => {
        const split = SplitText.create(q('[data-ph-title]'), { type: 'chars', tag: 'span', aria: 'none' })
        gsap.set(q('[data-ph-in]'), { autoAlpha: 1 })

        // ── 进场：小标签像被「解码」出来，标题逐字升起，右侧的空心序号从下面浮上来 ──
        const intro = gsap
          .timeline({ paused: true })
          .from(q('[data-ph-eyebrow]'), { autoAlpha: 0, x: -24, duration: 0.9 }, 0)
          .to(
            q('[data-ph-label]'),
            { scrambleText: { text: eyebrow, chars: 'upperCase', speed: 0.6 }, duration: 1.2, ease: 'none' },
            0.1,
          )
          .from(split.chars, { yPercent: 118, rotate: 6, transformOrigin: '0% 100%', duration: 1.35, stagger: 0.075 }, 0.12)
          .from(q('[data-ph-numeral]'), { yPercent: 40, autoAlpha: 0, duration: 1.8 }, 0.2)
          .from(q('[data-ph-intro]'), { autoAlpha: 0, y: 28, duration: 1.1 }, 0.6)
        cancel = stage.whenOpen(() => intro.play())

        // ── 往下滚：文字加速离场，背景和序号慢一拍 ──
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
          })
          .to(q('[data-ph-content]'), { yPercent: -22 }, 0)
          .to(q('[data-ph-content]'), { autoAlpha: 0, duration: 0.7 }, 0)
          .to(q('[data-ph-sky]'), { yPercent: 14, scale: 1.08 }, 0)
          .to(q('[data-ph-numeral-wrap]'), { yPercent: 34 }, 0)
      })

      // 等标题字体到了再拆字
      void document.fonts
        .load('700 1em "Noto Serif SC Sub"', title)
        .catch(() => undefined)
        .then(() => {
          if (alive) build()
        })

      return () => {
        alive = false
        cancel()
      }
    },
    { scope: root },
  )

  return (
    <header ref={root} className="relative isolate overflow-hidden">
      <title>{`${title}｜${brand.account}`}</title>
      <div data-ph-sky aria-hidden="true" className="sky-fade absolute inset-0 -z-20">
        <Aurora className="absolute inset-0" />
        <Stars count={36} seed={Number(index) * 31} className="absolute inset-0" />
        <div className="grain absolute inset-0" />
      </div>

      {children}

      {/* 右侧的空心大号页码 */}
      <div
        data-ph-numeral-wrap
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-[0.14em] right-[3%] -z-10 hidden select-none font-display text-[clamp(13rem,30vw,27rem)] italic leading-[0.8] md:block"
      >
        <span
          data-ph-in
          data-ph-numeral
          className="block text-transparent [-webkit-text-stroke:1.2px_rgb(255_255_255/0.13)]"
        >
          {index}
        </span>
      </div>

      <div data-ph-content className="mx-auto max-w-6xl px-5 pb-20 pt-36 md:pb-28 md:pt-44">
        <p data-ph-in data-ph-eyebrow className="eyebrow">
          <Sparkle className="size-3" />
          {index}
          <span className="h-px w-8 bg-white/25" />
          <span data-ph-label className="text-mist-300">
            {eyebrow}
          </span>
        </p>
        <h1
          data-ph-in
          className="mt-6 font-serif text-[clamp(3rem,10vw,6.5rem)] font-bold leading-[1.08] text-mist-50 [text-shadow:0_2px_40px_rgb(12_4_35/0.55)]"
        >
          {/* 读屏软件读这一份完整的；下面被拆成一个个字做动画的那份只给眼睛看 */}
          <span className="sr-only">{title}</span>
          {/* 上下方向的遮罩，标题的字从这道下沿升上来 */}
          <span aria-hidden="true" className="-my-[0.1em] block overflow-y-clip py-[0.1em]">
            <span data-ph-title className="block">
              {title}
            </span>
          </span>
        </h1>
        {intro && (
          <p
            data-ph-in
            data-ph-intro
            className="mt-6 max-w-xl text-base leading-8 text-mist-100 md:text-lg md:leading-9"
          >
            <Phrases text={intro} by={['。', '，']} />
          </p>
        )}
      </div>
    </header>
  )
}
