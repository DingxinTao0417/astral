import { useRef, type CSSProperties } from 'react'
import { brand } from '../content/site'
import { DESKTOP, gsap, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/hooks'
import { Sparkle } from './Icons'

/** 「解码」过程中闪过的代码字符 */
const GLYPHS = '01<>/{}[]#*+=_%$&@'
const randomGlyph = () => GLYPHS[Math.floor(Math.random() * GLYPHS.length)]

/** 渐变横跨一整行：第 i 个字取渐变里属于自己的那一段 */
const slice = (i: number, total: number): CSSProperties => ({
  backgroundSize: `${total * 100}% 100%`,
  backgroundPosition: `${total > 1 ? (i / (total - 1)) * 100 : 0}% 0`,
})

const BRACKETS = [
  '-left-[0.14em] -top-[0.06em] border-l-2 border-t-2',
  '-right-[0.14em] -top-[0.06em] border-r-2 border-t-2',
  '-bottom-[0.06em] -right-[0.14em] border-b-2 border-r-2',
  '-bottom-[0.06em] -left-[0.14em] border-b-2 border-l-2',
]

/**
 * 首页的标语段落，把「把审美语言，转成技术语言」这句话本身演一遍：
 * 上半句像相机对焦一样从虚到实（审美），下半句从一串跳动的代码字符逐字「解码」成文字（技术）。
 * 整个过程跟着滚动走：桌面端解码时会把这一屏钉住，解完再放行；手机上不钉，边滚边完成。
 */
export function Manifesto() {
  const root = useRef<HTMLElement>(null)
  // 在逗号后面断成上下两句
  const cut = brand.slogan.indexOf('，') + 1
  const firstChars = [...brand.slogan.slice(0, cut)]
  const secondChars = [...brand.slogan.slice(cut)]

  useGSAP(
    () => {
      const section = root.current
      if (!section || prefersReducedMotion()) return
      const q = gsap.utils.selector(section)
      const copy = q('[data-copy]')[0]
      const readout = q('[data-readout]')[0]
      const cells = q('[data-cell]').map((cell) => ({
        cell,
        code: cell.querySelector<HTMLElement>('[data-code]')!,
        state: '',
      }))
      const decode = { progress: 0 }

      /** 按解码进度给每个字定状态：还是代码 / 正在解 / 已经解出来 */
      const paint = () => {
        cells.forEach((item, i) => {
          // 每个字的解码窗口依次错开，前一个快解完时后一个开始
          const local = (decode.progress - (i / cells.length) * 0.74) / 0.26
          const next = local <= 0 ? 'code' : local < 1 ? 'hot' : 'done'
          if (next === item.state) return
          item.state = next
          item.cell.dataset.state = next
          if (next !== 'done') item.code.textContent = randomGlyph()
        })
        readout.textContent = `${String(Math.round(decode.progress * 100)).padStart(3, '0')}%`
      }
      paint()

      // 代码字符的跳动：正在解的字跳得快，还没轮到的偶尔闪一下。只在这一屏可见时跑
      let frame = 0
      const flicker = () => {
        frame++
        if (frame % 4 === 0) {
          cells.forEach((item) => {
            if (item.state === 'hot') item.code.textContent = randomGlyph()
          })
        }
        if (frame % 14 === 0) {
          const idle = cells.filter((item) => item.state === 'code')
          const pick = idle[Math.floor(Math.random() * idle.length)]
          if (pick) pick.code.textContent = randomGlyph()
        }
      }
      const visibility = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting) gsap.ticker.add(flicker)
        else gsap.ticker.remove(flicker)
      })
      visibility.observe(section)

      const mm = gsap.matchMedia()
      mm.add({ desktop: DESKTOP, compact: `not all and ${DESKTOP}` }, (context) => {
        const pinned = Boolean(context.conditions?.desktop)

        // 上半句：这一屏滚进来的过程中，从虚到实，像镜头对上了焦
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: pinned
              ? { trigger: section, start: 'top 70%', end: 'top top', scrub: 0.5 }
              : { trigger: copy, start: 'top 92%', end: 'top 46%', scrub: true },
          })
          .fromTo(q('[data-tag="a"]'), { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.3 }, 0)
          .fromTo(
            q('[data-focus]'),
            { filter: 'blur(16px)', opacity: 0.08, yPercent: 20 },
            { filter: 'blur(0px)', opacity: 1, yPercent: 0, stagger: 0.12, duration: 0.5, ease: 'power2.out' },
            0.05,
          )

        // 下半句：逐字解码，解完四个角标收紧「锁定」
        gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: pinned
              ? { trigger: section, start: 'top top', end: '+=110%', pin: true, scrub: 0.6, anticipatePin: 1 }
              : { trigger: copy, start: 'top 56%', end: 'top 18%', scrub: true },
          })
          .fromTo(q('[data-tag="b"]'), { autoAlpha: 0, x: -24 }, { autoAlpha: 1, x: 0, duration: 0.12 }, 0)
          .fromTo(decode, { progress: 0 }, { progress: 1, duration: 0.68, onUpdate: paint }, 0.06)
          .fromTo(
            q('[data-bracket]'),
            { autoAlpha: 0, scale: 1.6 },
            { autoAlpha: 1, scale: 1, duration: 0.2, ease: 'power3.out' },
            0.7,
          )
          // 留一小段什么都不动的滚动距离，让人看清结果再放行
          .to({}, { duration: 0.1 })

        // 背后的大星跟着整段滚动慢慢转
        gsap.fromTo(
          q('[data-star]'),
          { rotate: -70, scale: 0.7 },
          {
            rotate: 70,
            scale: 1.15,
            ease: 'none',
            scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
          },
        )
      })

      return () => {
        mm.revert()
        visibility.disconnect()
        gsap.ticker.remove(flicker)
      }
    },
    { scope: root },
  )

  return (
    <section
      ref={root}
      className="relative isolate flex flex-col justify-center overflow-hidden px-5 py-28 desk:min-h-svh desk:py-16"
    >
      <p className="sr-only">{brand.slogan}</p>
      {/* 背后一颗很淡的大星 */}
      <div className="pointer-events-none absolute inset-0 -z-10 grid place-items-center [mask-image:linear-gradient(transparent,#000_22%,#000_78%,transparent)]">
        <Sparkle data-star className="size-[min(120vw,70rem)] shrink-0 text-iris-500/[0.07]" />
      </div>

      <div
        data-copy
        aria-hidden="true"
        className="mx-auto w-full max-w-6xl font-serif text-[clamp(2.25rem,min(calc((100vw_-_2.5rem)_/_7.05),17svh),8.75rem)] font-black leading-[1.16]"
      >
        <p data-tag="a" className="eyebrow mb-[0.5em]">
          <Sparkle className="size-3" />
          01
          <span className="h-px w-8 bg-white/25" />
          <span className="text-mist-300">Aesthetic</span>
        </p>
        <p className="whitespace-nowrap">
          {firstChars.map((char, i) => (
            <span
              key={i}
              data-focus
              className="text-aurora inline-block will-change-[filter,opacity]"
              style={slice(i, firstChars.length)}
            >
              {char}
            </span>
          ))}
        </p>

        <div className="mt-[0.34em] flex justify-end">
          <div>
            <p data-tag="b" className="eyebrow mb-[0.5em]">
              <Sparkle className="size-3" />
              02
              <span className="h-px w-8 bg-white/25" />
              <span className="text-mist-300">Technical</span>
              <span data-readout className="ml-auto pl-6 tabular-nums text-mist-400">
                100%
              </span>
            </p>
            <p className="manifesto-code relative whitespace-nowrap text-mist-50">
              {secondChars.map((char, i) => (
                <span key={i} data-cell data-state="done" className="relative inline-block">
                  <span data-final>{char}</span>
                  <span
                    data-code
                    className="absolute inset-0 grid place-items-center font-mono text-[0.62em] font-normal"
                  />
                </span>
              ))}
              {/* 四个角标：解码完成时收紧，像取景框对上了焦 */}
              {BRACKETS.map((corner) => (
                <span key={corner} data-bracket className={`absolute size-[0.22em] border-blush-300 ${corner}`} />
              ))}
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
