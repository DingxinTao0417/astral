import { useRef, type ReactNode } from 'react'
import { about, experience, home } from '../content/site'
import { cx } from '../lib/cx'
import { DESKTOP, gsap, useGSAP } from '../lib/gsap'
import { trackSpotlight } from '../lib/hooks'
import { scroller } from '../lib/scroll'
import { SplitText } from './bits/SplitText'
import { Holo } from './Holo'
import { ArrowRight, Sparkle } from './Icons'
import { Img } from './Img'
import { TLink } from './motion/Transition'
import { Phrases } from './Phrases'
import { Reveal } from './Reveal'

type Kind = (typeof home.entries)[number]['kind']

interface Visual {
  /** 浅色珠光卡 */
  pearl?: boolean
  /** 铺一层极光，作为最显眼的入口 */
  aurora?: boolean
  render: () => ReactNode
}

const HOLO_RING =
  'bg-[conic-gradient(from_140deg,#ffa3d5,#cdb5ff,#9be8ff,#ffe6f4,#ff78bf,#ad8cff,#ffd9c2,#ffa3d5)]'

/** 每种入口卡片的画面 */
const VISUALS: Record<Kind, Visual> = {
  // AI 学习：三张叠在一起的资料卡
  learn: {
    aurora: true,
    render: () => (
      <div className="relative mx-auto h-44 w-full max-w-md md:h-52 desk:h-[min(16rem,32svh)] desk:max-w-lg">
        {['工具清单', '工作流', '提示词'].map((name, i) => (
          <div
            key={name}
            className="absolute top-1/2 w-[46%] rounded-2xl border border-white/20 bg-night-900/70 p-4 shadow-[0_24px_60px_-24px_rgb(7_2_22/0.95)] backdrop-blur-sm desk:p-5"
            style={{
              left: `${6 + i * 21}%`,
              translate: `0 calc(-50% + ${(1 - i) * 10}px)`,
              rotate: `${(i - 1) * 6}deg`,
              zIndex: i,
            }}
          >
            <span className="inline-block rounded-full bg-linear-to-r from-blush-200 to-iris-300 px-2.5 py-0.5 text-[11px] font-medium text-night-800">
              {name}
            </span>
            <div className="mt-3 space-y-2 desk:mt-4 desk:space-y-2.5">
              <div className="h-1.5 rounded-full bg-white/25" />
              <div className="h-1.5 w-4/5 rounded-full bg-white/15" />
              <div className="h-1.5 w-3/5 rounded-full bg-white/15" />
            </div>
          </div>
        ))}
      </div>
    ),
  },
  // 作品：成品 banner 上叠一张竖版视频封面
  works: {
    render: () => (
      <div className="relative h-36 sm:h-52 md:h-64 desk:h-[min(18rem,36svh)]">
        <Holo className="absolute left-0 top-3 w-[76%] -rotate-2 md:top-4 desk:top-8">
          <Img id="banner-clip" alt="" variant="sm" className="aspect-video w-full object-cover" />
        </Holo>
        <Holo className="absolute right-[4%] top-0 w-[26%] rotate-6">
          <Img id="aigc-film-poster" alt="" variant="sm" className="aspect-9/16 w-full object-cover" />
        </Holo>
      </div>
    ),
  },
  // 经历：浅色珠光卡，直接上数字
  experience: {
    pearl: true,
    render: () => (
      <dl className="flex h-52 flex-col justify-center gap-3 md:h-64 desk:mx-auto desk:h-auto desk:max-w-sm desk:gap-[clamp(0.6rem,2.2svh,1.25rem)]">
        {experience.creator.stats.slice(0, 2).map((s) => (
          <div
            key={s.label}
            className="flex items-baseline justify-between gap-4 border-b border-night-600/15 pb-3 desk:pb-[clamp(0.6rem,2.2svh,1.25rem)]"
          >
            <dt className="text-sm text-night-600">{s.label}</dt>
            <dd className="font-display text-[3.4rem] leading-none desk:text-[clamp(2.75rem,7.5svh,4.25rem)]">
              <span className="text-orchid">{s.value}</span>
              <span className="ml-1 text-[0.36em] font-bold text-night-700">{s.unit}</span>
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-night-600">{experience.sales.caption}</dt>
          <dd className="font-display text-[3.4rem] leading-none desk:text-[clamp(2.75rem,7.5svh,4.25rem)]">
            <span className="text-orchid">{experience.sales.percent}</span>
            <span className="ml-1 text-[0.36em] font-bold text-night-700">%</span>
          </dd>
        </div>
      </dl>
    ),
  },
  // 影像：三张照片叠成一小摞
  frames: {
    render: () => (
      <div className="relative mx-auto h-52 w-full max-w-sm md:h-64 desk:h-[min(20rem,38svh)] desk:max-w-[min(28rem,50svh)]">
        <Holo className="absolute left-[2%] top-5 w-[40%] -rotate-9">
          <Img id="portrait-4" alt="" variant="sm" className="aspect-3/4 w-full object-cover" />
        </Holo>
        <Holo className="absolute right-[2%] top-5 w-[40%] rotate-9">
          <Img id="product-5" alt="" variant="sm" className="aspect-3/4 w-full object-cover" />
        </Holo>
        <Holo className="absolute left-1/2 top-0 w-[42%] -translate-x-1/2">
          <Img id="aerial-2" alt="" variant="sm" className="aspect-3/4 w-full object-cover" />
        </Holo>
      </div>
    ),
  },
  // 关于：拱形小相框
  about: {
    render: () => (
      <div className="flex h-52 items-end justify-center md:h-64 desk:h-[min(20rem,38svh)]">
        <div className={cx('h-full rounded-t-full p-[1.5px] pb-0', HOLO_RING)}>
          <Img
            id={about.portrait}
            alt=""
            variant="sm"
            className="aspect-3/4 h-full w-auto rounded-t-full object-cover object-[50%_28%]"
          />
        </div>
      </div>
    ),
  },
}

const pad = (n: number) => String(n).padStart(2, '0')

/**
 * 首页的入口卡片：每张通向一个子页面。
 * 桌面端是一条横向画廊：滚到这里时整屏钉住，继续往下滚，卡片从右往左依次经过，全部看完再放行。
 * 手机和平板上是普通的上下排列。
 */
export function Gateway() {
  const root = useRef<HTMLElement>(null)
  const total = home.entries.length

  useGSAP(
    () => {
      const section = root.current
      if (!section) return
      const q = gsap.utils.selector(section)
      const mm = gsap.matchMedia()

      mm.add(DESKTOP, () => {
        const pin = q('[data-gw-pin]')[0] as HTMLElement
        const track = q('[data-gw-track]')[0] as HTMLElement
        const count = q('[data-gw-count]')[0]
        const cards = q('[data-gw-card]') as HTMLElement[]
        const distance = () => Math.max(0, track.offsetWidth - pin.clientWidth)
        // 横向要走的距离比较长，纵向只用它的六成多就滚完，不然这一段会显得拖沓
        const travel = () => distance() * 0.65

        const slide = gsap
          .timeline({
            defaults: { ease: 'none' },
            scrollTrigger: {
              trigger: pin,
              start: 'top top',
              end: () => `+=${travel()}`,
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
            },
          })
          .to(track, { x: () => -distance() }, 0)
          .fromTo(q('[data-gw-fill]'), { scaleX: 0 }, { scaleX: 1 }, 0)
        slide.eventCallback('onUpdate', () => {
          count.textContent = pad(Math.round(slide.progress() * (cards.length - 1)) + 1)
        })

        // 每张卡经过屏幕时，里面的画面比卡片本身走得慢一点，有前后层次
        cards.forEach((card) => {
          gsap.fromTo(
            card.querySelector('[data-gw-visual]'),
            { xPercent: 6 },
            {
              xPercent: -6,
              ease: 'none',
              scrollTrigger: {
                trigger: card,
                containerAnimation: slide,
                start: 'left right',
                end: 'right left',
                scrub: true,
              },
            },
          )
        })

        // 用键盘 Tab 到屏幕外的卡片时，把页面滚到对应的位置
        const onFocus = (e: FocusEvent) => {
          const target = e.target as HTMLElement
          const index = cards.indexOf(target.closest<HTMLElement>('[data-gw-card]')!)
          const trigger = slide.scrollTrigger
          pin.scrollLeft = 0
          if (index < 0 || !trigger || !target.matches(':focus-visible')) return
          scroller.to(trigger.start + ((trigger.end - trigger.start) * index) / (cards.length - 1))
        }
        track.addEventListener('focusin', onFocus)
        return () => track.removeEventListener('focusin', onFocus)
      })

      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <section ref={root} aria-labelledby="gateway-title" className="pb-10 md:pb-16 desk:pb-0">
      <div
        data-gw-pin
        className="desk:flex desk:h-svh desk:flex-col desk:justify-center desk:overflow-hidden desk:pb-6 desk:pt-[clamp(4.75rem,11svh,5.5rem)]"
      >
        <header className="mx-auto w-full max-w-6xl px-5 desk:flex desk:items-end desk:justify-between desk:gap-10">
          <div>
            <Reveal>
              <p className="eyebrow">
                <Sparkle className="size-3" />
                {home.eyebrow}
              </p>
            </Reveal>
            <SplitText
              tag="h2"
              id="gateway-title"
              className="mt-5 font-serif text-[clamp(2.4rem,7vw,4.25rem)] font-bold leading-[1.12] text-mist-50 desk:mt-3 desk:text-[clamp(2.25rem,6.4svh,3.75rem)]"
            >
              {home.title}
            </SplitText>
          </div>
          <Reveal delay={150}>
            <p className="mt-4 text-[15px] text-mist-300 md:text-lg desk:mt-0 desk:pb-2 desk:text-base">
              {home.intro}
            </p>
          </Reveal>
        </header>

        <div
          data-gw-track
          className="mx-auto mt-10 grid max-w-6xl gap-4 px-5 md:mt-14 md:gap-5 desk:mx-0 desk:mt-[clamp(1rem,3.4svh,2rem)] desk:flex desk:w-max desk:max-w-none desk:gap-6 desk:px-[max(1.25rem,calc((100vw_-_72rem)_/_2_+_1.25rem))] desk:will-change-transform"
        >
          {home.entries.map((entry, i) => {
            const { pearl, aurora, render } = VISUALS[entry.kind]
            return (
              <Reveal
                key={entry.to}
                delay={(i % 2) * 110}
                className="desk:h-[min(55svh,33rem)] desk:w-[min(74vw,58rem)] desk:shrink-0"
              >
                <TLink
                  to={entry.to}
                  data-gw-card
                  onPointerMove={pearl ? undefined : trackSpotlight}
                  className={cx(
                    'group relative isolate flex h-full flex-col overflow-hidden p-6 transition-[translate] duration-500 ease-soft hover:-translate-y-1.5 md:p-9 desk:flex-row-reverse desk:items-center desk:gap-10 desk:p-[clamp(1.75rem,5svh,3rem)]',
                    pearl ? 'card-pearl' : 'card spot',
                  )}
                >
                  {aurora && <span aria-hidden="true" className="hero-sky absolute inset-0 -z-10 opacity-70" />}
                  <div data-gw-visual className="desk:w-[52%]">
                    {render()}
                  </div>

                  <div className="mt-7 flex items-end justify-between gap-5 desk:mt-0 desk:w-[48%] desk:flex-col desk:items-start desk:justify-center desk:gap-[clamp(1rem,3svh,1.75rem)]">
                    <div>
                      {/* 序号：手机上是一行小字，桌面端的画廊里放大成空心斜体 */}
                      <p
                        className={cx(
                          'font-mono text-[11px] tracking-[0.28em] desk:font-display desk:text-[clamp(3.5rem,11svh,6.5rem)] desk:italic desk:leading-[0.85] desk:tracking-normal desk:text-transparent',
                          pearl
                            ? 'text-[#b3267f] desk:[-webkit-text-stroke:1.2px_rgb(179_38_127/0.45)]'
                            : 'text-blush-300 desk:[-webkit-text-stroke:1.2px_rgb(255_163_213/0.5)]',
                        )}
                      >
                        {pad(i + 1)}
                      </p>
                      <h3
                        className={cx(
                          'mt-2 font-serif text-[1.9rem] font-bold leading-tight md:text-[2.3rem] desk:mt-[clamp(0.5rem,2svh,1.25rem)] desk:text-[clamp(2rem,5.6svh,3.4rem)]',
                          pearl ? 'text-night-800' : 'text-mist-50',
                        )}
                      >
                        {entry.title}
                      </h3>
                      <p
                        className={cx(
                          'mt-2.5 max-w-sm text-sm leading-7 md:text-[15px] desk:mt-4 desk:text-base desk:leading-8',
                          pearl ? 'text-night-600' : aurora ? 'text-mist-100' : 'text-mist-300',
                        )}
                      >
                        <Phrases text={entry.desc} by="。" />
                      </p>
                    </div>
                    <span
                      className={cx(
                        'flex h-13 shrink-0 items-center justify-center gap-2.5 rounded-full text-sm font-medium transition-[translate,background-color] duration-500 ease-soft group-hover:translate-x-1 compact:w-13 desk:px-6',
                        pearl
                          ? 'bg-night-800 text-blush-100 group-hover:bg-night-700'
                          : 'border border-white/20 bg-white/8 text-mist-50 group-hover:bg-white/16',
                      )}
                    >
                      <span className="compact:sr-only">{entry.cta}</span>
                      <ArrowRight className="size-5" />
                    </span>
                  </div>
                </TLink>
              </Reveal>
            )
          })}
        </div>

        {/* 画廊进度：只在横向滚动的桌面端显示 */}
        <div
          aria-hidden="true"
          className="mx-auto mt-[clamp(0.75rem,3svh,1.75rem)] hidden w-full max-w-6xl items-center gap-5 px-5 font-mono text-[11px] tracking-[0.24em] text-mist-400 desk:flex"
        >
          <span data-gw-count className="text-blush-300">
            01
          </span>
          <span className="relative h-px flex-1 bg-white/12">
            <span
              data-gw-fill
              className="absolute inset-0 origin-left bg-linear-to-r from-blush-400 via-iris-300 to-iris-500"
            />
          </span>
          <span>{pad(total)}</span>
        </div>
      </div>
    </section>
  )
}
