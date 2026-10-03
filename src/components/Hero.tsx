import { useCallback, useRef, type CSSProperties } from 'react'
import { brand, hero, tools } from '../content/site'
import { DESKTOP, gsap, SplitText, useGSAP } from '../lib/gsap'
import { offsetWithin, prefersReducedMotion, useMedia } from '../lib/hooks'
import { stage } from '../lib/stage'
import { Aurora } from './Aurora'
import { Stars } from './Backdrop'
import { Magnet } from './bits/Magnet'
import { Holo } from './Holo'
import { ArrowRight, ArrowUpRight, Sparkle } from './Icons'
import { Img } from './Img'
import { TLink } from './motion/Transition'
import { VantaNova, type RingGeometry } from './motion/VantaNova'
import { VelocityMarquee } from './motion/VelocityMarquee'
import { Phrases } from './Phrases'

/** 标题每个字母左右的留白（em），和 index.css 里 .hero-char 的写法一致 */
const CHAR_PAD = 0.14
/** 内容跟随鼠标的幅度（以屏幕高度为 1），和光环的 mouseShift 一致，这样星星始终压在光环上 */
const DRIFT = 0.03

/** 每个字母在原文里的左边缘位置（em）。拆字之前量，带着字体自己的字距微调 */
function measureLetters(el: HTMLElement) {
  const node = el.firstChild
  if (!(node instanceof Text)) return null
  const fontSize = parseFloat(getComputedStyle(el).fontSize)
  const box = el.getBoundingClientRect()
  const range = document.createRange()
  const lefts = [...node.data].map((_, i) => {
    range.setStart(node, i)
    range.setEnd(node, i + 1)
    return (range.getBoundingClientRect().left - box.left) / fontSize
  })
  return { lefts, width: box.width / fontSize, fontSize }
}

export function Hero() {
  const root = useRef<HTMLElement>(null)
  const block = useRef<HTMLDivElement>(null)
  const flare = useRef<HTMLSpanElement>(null)
  const desktop = useMedia(DESKTOP)

  /** 光环的位置：圆心在标题到按钮这一块的正中，半径刚好让光环穿过标题右上角的星 */
  const measureRing = useCallback((): RingGeometry | null => {
    const section = root.current
    const content = block.current
    const star = flare.current
    if (!section || !content || !star) return null
    const top = offsetWithin(content, section).y
    const starAt = offsetWithin(star, section)
    const x = section.offsetWidth / 2
    const y = top + content.offsetHeight / 2
    const dx = starAt.x + star.offsetWidth / 2 - x
    const dy = y - (starAt.y + star.offsetHeight / 2)
    return { x, y, r: Math.hypot(dx, dy), angle: Math.atan2(dx, dy) }
  }, [])

  useGSAP(
    (_, contextSafe) => {
      const section = root.current
      if (!section || prefersReducedMotion()) return
      const q = gsap.utils.selector(section)
      let alive = true
      let cancel = () => {}

      // 进场前先藏起来；背景不藏，幕布一拉开就能看到极光
      gsap.set(q('[data-hero-in]'), { autoAlpha: 0 })

      const build = contextSafe!(() => {
        const title = q('[data-hero-title]')[0]
        const letters = measureLetters(title)

        // ── 标题逐字母拆开，并把字体原本的字距补回去 ──
        const split = SplitText.create(title, { type: 'chars', charsClass: 'hero-char', tag: 'span', aria: 'none' })
        title.classList.remove('text-aurora', 'hero-title-sheen')
        if (letters) {
          title.style.setProperty('--word-w', `${letters.width}em`)
          const origin = title.getBoundingClientRect().left
          split.chars.forEach((char, i) => {
            const el = char as HTMLElement
            const actual = (el.getBoundingClientRect().left - origin) / letters.fontSize + CHAR_PAD
            el.style.marginLeft = `${(letters.lefts[i] - actual - CHAR_PAD).toFixed(4)}em`
            el.style.setProperty('--char-x', `${(letters.lefts[i] - CHAR_PAD).toFixed(4)}em`)
          })
        }
        const cn = SplitText.create(q('[data-hero-cn]'), { type: 'chars', tag: 'span', aria: 'none' })
        gsap.set(q('[data-hero-in]'), { autoAlpha: 1 })

        // ── 进场 ──
        const slots = q('[data-fan-slot]')
        const intro = gsap
          .timeline({ paused: true })
          .from(split.chars, { yPercent: 112, rotate: 9, transformOrigin: '0% 100%', duration: 1.5, stagger: 0.075 }, 0)
          .from(cn.chars, { yPercent: 120, duration: 1.2, stagger: 0.055 }, 0.4)
          .from(
            q('[data-hero-flare]'),
            { scale: 0, rotate: -200, autoAlpha: 0, duration: 1.5, ease: 'back.out(2.2)' },
            0.75,
          )
          .from(q('[data-hero-rule]'), { scaleX: 0, duration: 1.1, ease: 'power3.inOut' }, 0.85)
          .from(q('[data-hero-slogan]'), { autoAlpha: 0, letterSpacing: '0.5em', duration: 1.4 }, 0.85)
          .from(q('[data-hero-intro]'), { autoAlpha: 0, y: 26, duration: 1.1 }, 1.05)
          .from(q('[data-hero-cta]'), { autoAlpha: 0, y: 26, duration: 1.1, stagger: 0.1 }, 1.15)
          .from(
            slots,
            {
              yPercent: 135,
              rotate: (i) => (i - (slots.length - 1) / 2) * -9,
              duration: 1.6,
              stagger: { each: 0.09, from: 'center' },
            },
            0.6,
          )
          .from(q('[data-hero-bar]'), { yPercent: 100, duration: 1.1 }, 0.9)

        // 标题上那道缓慢来回的高光。进场快结束时开始；首屏滚出屏幕后暂停，滚回来再继续
        const sheen = gsap.to(title, {
          '--sheen': 1,
          duration: 9,
          ease: 'sine.inOut',
          repeat: -1,
          yoyo: true,
          paused: true,
        })
        let sheenReady = false
        intro.add(() => {
          sheenReady = true
          sheen.play()
        }, 1.4)

        cancel = stage.whenOpen(() => intro.play())

        // ── 往下滚：文字加速上移并淡出，背景慢一拍，扇形卡组向两边展开 ──
        const middle = (slots.length - 1) / 2
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: section,
              start: 'top top',
              end: 'bottom top',
              scrub: true,
              invalidateOnRefresh: true,
              onToggle: (self) => {
                if (!sheenReady) return
                if (self.isActive) sheen.play()
                else sheen.pause()
              },
            },
          })
          .to(q('[data-hero-scroll]'), { y: () => window.innerHeight * -0.16 }, 0)
          .to(q('[data-hero-scroll]'), { autoAlpha: 0, duration: 0.6 }, 0)
          .to(q('[data-hero-sky]'), { yPercent: 12, scale: 1.08 }, 0)
          .to(
            q('[data-fan-lift]'),
            {
              xPercent: (i) => (i - middle) * 24,
              yPercent: (i) => -30 - Math.abs(i - middle) * 12,
              rotate: (i) => (i - middle) * 5,
            },
            0,
          )
      })

      // 等标题字体到了再拆，不然量出来的是系统字体的字距
      void Promise.all([
        document.fonts.load('italic 1em "Instrument Serif"'),
        document.fonts.load('700 1em "Noto Serif SC Sub"', brand.cnName),
      ])
        .catch(() => undefined)
        .then(() => {
          if (alive) build()
        })

      // ── 鼠标视差：内容跟着鼠标轻轻偏，卡组反方向偏一点，拉出前后层次 ──
      const mm = gsap.matchMedia()
      mm.add(DESKTOP, () => {
        const ease = { duration: 1, ease: 'power3.out' }
        const driftX = gsap.quickTo(q('[data-hero-drift]'), 'x', ease)
        const driftY = gsap.quickTo(q('[data-hero-drift]'), 'y', ease)
        const fanX = gsap.quickTo(q('[data-hero-fan]'), 'x', ease)
        const onMove = (e: MouseEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5
          const ny = e.clientY / window.innerHeight - 0.5
          driftX(nx * window.innerHeight * DRIFT)
          driftY(ny * window.innerHeight * DRIFT)
          fanX(nx * window.innerHeight * -0.025)
        }
        section.addEventListener('mousemove', onMove, { passive: true })
        return () => section.removeEventListener('mousemove', onMove)
      })

      return () => {
        alive = false
        cancel()
        mm.revert()
      }
    },
    { scope: root },
  )

  return (
    <section ref={root} className="hero relative isolate flex min-h-svh flex-col overflow-hidden">
      <div data-hero-sky aria-hidden="true" className="sky-fade absolute inset-0 -z-10">
        <Aurora className="absolute inset-0" />
        {/* 光环只在用鼠标的大屏上开：它会被鼠标牵引，手机上看不出来，还费电 */}
        {desktop && <VantaNova className="absolute inset-0" measure={measureRing} watch={block} />}
        <Stars count={56} seed={7} className="absolute inset-0" />
        <div className="grain absolute inset-0" />
      </div>

      <div data-hero-scroll className="flex flex-1 flex-col">
        <div
          data-hero-drift
          className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 pb-(--hero-pb) pt-(--hero-pt) text-center"
        >
          <div ref={block} className="flex flex-col items-center">
            <h1 data-hero-in className="relative">
              {/* 读屏软件读这一份完整的；下面被拆成一个个字母做动画的那份只给眼睛看 */}
              <span className="sr-only">
                {brand.name} {brand.cnName}
              </span>
              {/* 标题背后的一团柔光，把字从极光里托出来 */}
              <span
                aria-hidden="true"
                className="absolute left-1/2 top-[38%] -z-10 aspect-[2/1] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(12_4_35/0.55),transparent)]"
              />
              <span
                aria-hidden="true"
                className="relative inline-block font-display text-[clamp(5.5rem,min(35vw,var(--hero-title)),19rem)] italic leading-[0.84]"
              >
                {/* 上下方向的遮罩：字母从这道下沿升上来。左右不裁，斜体字母探出去的部分才不会被切掉 */}
                <span className="-my-[0.12em] block overflow-y-clip px-[0.14em] py-[0.12em]">
                  <span
                    data-hero-title
                    className="hero-title hero-title-sheen text-aurora -mx-[0.14em] block px-[0.14em]"
                  >
                    {brand.name}
                  </span>
                </span>
                <span ref={flare} data-hero-flare className="flare right-[0.01em] top-[0.03em]">
                  <span className="flare-glow" />
                  <span className="flare-ray" />
                  <span className="flare-ray flare-ray-v" />
                  <Sparkle className="flare-star" />
                </span>
              </span>
              <span aria-hidden="true" className="mt-4 block overflow-y-clip">
                <span
                  data-hero-cn
                  className="block pl-[0.14em] font-serif text-[clamp(2rem,min(8.6vw,var(--hero-sub)),4.75rem)] font-bold leading-tight tracking-[0.14em] text-mist-50 [text-shadow:0_2px_40px_rgb(12_4_35/0.6)]"
                >
                  {brand.cnName}
                </span>
              </span>
            </h1>

            <p
              data-hero-in
              className="mt-[clamp(1.25rem,3.4svh,2.25rem)] flex items-center gap-4 pl-[0.2em] text-base font-medium tracking-[0.2em] text-mist-50 md:text-xl"
            >
              <span
                data-hero-rule
                aria-hidden="true"
                className="hidden h-px w-10 origin-right bg-linear-to-r from-transparent to-blush-300 sm:block"
              />
              <span data-hero-slogan>{brand.slogan.replace(/。$/, '')}</span>
              <span
                data-hero-rule
                aria-hidden="true"
                className="hidden h-px w-10 origin-left bg-linear-to-l from-transparent to-blush-300 sm:block"
              />
            </p>
            <p
              data-hero-in
              data-hero-intro
              className="mt-3 max-w-xl text-balance text-[15px] leading-8 text-mist-300 md:text-base"
            >
              <Phrases text={hero.intro} by={['。', '，']} />
            </p>

            <div
              data-hero-in
              className="mt-[clamp(1.5rem,4svh,2.25rem)] flex flex-wrap items-center justify-center gap-3"
            >
              {/* 进场动画加在外面这层上，不直接动按钮：GSAP 接管过的元素，样式表里的悬停位移就不生效了 */}
              <div data-hero-cta>
                <Magnet>
                  <a
                    href={brand.douyinUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-primary h-13 px-7 text-[15px]"
                  >
                    {hero.primaryCta}
                    <ArrowUpRight className="size-4" />
                  </a>
                </Magnet>
              </div>
              <div data-hero-cta>
                <Magnet>
                  <TLink to="/works" className="btn btn-ghost h-13 px-7 text-[15px]">
                    {hero.secondaryCta}
                    <ArrowRight className="size-4" />
                  </TLink>
                </Magnet>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Fan />
      <Marquee items={tools} />
    </section>
  )
}

/** 首屏底部扇形排开的镭射作品卡，下半截藏在屏幕外，鼠标移上去会抽出来 */
function Fan() {
  const middle = (hero.fan.length - 1) / 2
  return (
    <div data-hero-in data-hero-fan className="fan">
      {hero.fan.map((card, i) => {
        const offset = i - middle
        return (
          // 三层各管一件事：最外层管进场，中间层管滚动时展开，卡片自己管扇形排布和鼠标悬停
          <div key={card.id} data-fan-slot className="fan-slot" style={{ zIndex: 10 - Math.abs(offset) }}>
            <div data-fan-lift>
              <TLink
                to={card.to}
                aria-label={`${card.label}，查看作品`}
                data-cursor="查看"
                className="fan-card rounded-[1.1rem]"
                style={{ '--o': offset, '--abs': Math.abs(offset) } as CSSProperties}
              >
                <Holo>
                  <Img id={card.id} alt="" variant="sm" eager className="aspect-3/4 w-full object-cover" />
                  <span className="absolute left-2 top-2 z-3 rounded-full bg-night-900/70 px-2 py-0.5 text-[10px] leading-4 tracking-wide text-mist-50 backdrop-blur-sm md:left-2.5 md:top-2.5 md:px-2.5 md:text-[11px]">
                    {card.label}
                  </span>
                </Holo>
              </TLink>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** 首屏最底部的工具条，压在扇形卡组上面，保证第一屏就能看到。页面一滚动它会跟着加速 */
function Marquee({ items }: { items: string[] }) {
  return (
    <div
      data-hero-in
      data-hero-bar
      className="relative z-40 border-y border-white/10 bg-night-900/85 py-4 backdrop-blur-md"
    >
      <VelocityMarquee speed={42} boost={5} copies={3} className="fade-x">
        <ul className="flex shrink-0 items-center">
          {items.map((name) => (
            <li
              key={name}
              className="flex items-center gap-7 whitespace-nowrap pr-7 font-mono text-xs uppercase tracking-[0.2em] text-mist-300"
            >
              <Sparkle className="size-2.5 text-blush-400" />
              {name}
            </li>
          ))}
        </ul>
      </VelocityMarquee>
    </div>
  )
}
