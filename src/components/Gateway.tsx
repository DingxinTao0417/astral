import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { about, experience, home } from '../content/site'
import { cx } from '../lib/cx'
import { trackSpotlight } from '../lib/hooks'
import { Holo } from './Holo'
import { ArrowRight, Sparkle } from './Icons'
import { Img } from './Img'
import { Phrases } from './Phrases'
import { Reveal } from './Reveal'

type Kind = (typeof home.entries)[number]['kind']

interface Visual {
  /** 桌面端占几列（共 12 列） */
  span: string
  /** 浅色珠光卡 */
  pearl?: boolean
  /** 通栏卡：桌面端文字在左、画面在右 */
  wide?: boolean
  render: () => ReactNode
}

const HOLO_RING =
  'bg-[conic-gradient(from_140deg,#ffa3d5,#cdb5ff,#9be8ff,#ffe6f4,#ff78bf,#ad8cff,#ffd9c2,#ffa3d5)]'

/** 每种入口卡片的画面 */
const VISUALS: Record<Kind, Visual> = {
  // AI 学习：三张叠在一起的资料卡
  learn: {
    span: 'lg:col-span-12',
    wide: true,
    render: () => (
      <div className="relative mx-auto h-44 w-full max-w-md md:h-52">
        {['工具清单', '工作流', '提示词'].map((name, i) => (
          <div
            key={name}
            className="absolute top-1/2 w-[46%] rounded-2xl border border-white/20 bg-night-900/70 p-4 shadow-[0_24px_60px_-24px_rgb(7_2_22/0.95)] backdrop-blur-sm"
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
            <div className="mt-3 space-y-2">
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
    span: 'lg:col-span-7',
    render: () => (
      <div className="relative h-36 sm:h-52 md:h-64">
        <Holo className="absolute left-0 top-3 w-[76%] -rotate-2 md:top-4">
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
    span: 'lg:col-span-5',
    pearl: true,
    render: () => (
      <dl className="flex h-52 flex-col justify-center gap-3 md:h-64">
        {experience.creator.stats.slice(0, 2).map((s) => (
          <div key={s.label} className="flex items-baseline justify-between gap-4 border-b border-night-600/15 pb-3">
            <dt className="text-sm text-night-600">{s.label}</dt>
            <dd className="font-display text-[3.4rem] leading-none">
              <span className="text-orchid">{s.value}</span>
              <span className="ml-1 text-[0.36em] font-bold text-night-700">{s.unit}</span>
            </dd>
          </div>
        ))}
        <div className="flex items-baseline justify-between gap-4">
          <dt className="text-sm text-night-600">{experience.sales.caption}</dt>
          <dd className="font-display text-[3.4rem] leading-none">
            <span className="text-orchid">{experience.sales.percent}</span>
            <span className="ml-1 text-[0.36em] font-bold text-night-700">%</span>
          </dd>
        </div>
      </dl>
    ),
  },
  // 影像：三张照片叠成一小摞
  frames: {
    span: 'lg:col-span-5',
    render: () => (
      <div className="relative mx-auto h-52 w-full max-w-sm md:h-64">
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
    span: 'lg:col-span-7',
    render: () => (
      <div className="flex h-52 items-end justify-center md:h-64">
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

/** 首页的入口卡片：每张通向一个子页面 */
export function Gateway() {
  return (
    <section aria-labelledby="gateway-title" className="mx-auto max-w-6xl px-5 pb-10 md:pb-16">
      <Reveal>
        <p className="eyebrow">
          <Sparkle className="size-3" />
          {home.eyebrow}
        </p>
        <h2
          id="gateway-title"
          className="mt-5 font-serif text-[clamp(2.4rem,7vw,4.25rem)] font-bold leading-[1.12] text-mist-50"
        >
          {home.title}
        </h2>
        <p className="mt-4 text-[15px] text-mist-300 md:text-lg">{home.intro}</p>
      </Reveal>

      <div className="mt-10 grid gap-4 md:mt-14 md:gap-5 lg:grid-cols-12">
        {home.entries.map((entry, i) => {
          const visual = VISUALS[entry.kind]
          const { pearl, wide } = visual
          return (
            <Reveal key={entry.to} className={visual.span} delay={(i % 2) * 110}>
              <Link
                to={entry.to}
                onPointerMove={pearl ? undefined : trackSpotlight}
                className={cx(
                  'group relative isolate flex h-full flex-col overflow-hidden p-6 transition-[translate] duration-500 ease-soft hover:-translate-y-1.5 md:p-9',
                  pearl ? 'card-pearl' : 'card spot',
                  wide && 'lg:flex-row-reverse lg:items-center lg:gap-10',
                )}
              >
                {/* 通栏卡铺一层极光，作为首页最显眼的入口 */}
                {wide && <span aria-hidden="true" className="hero-sky absolute inset-0 -z-10 opacity-70" />}

                <div className={cx(wide && 'lg:w-1/2')}>{visual.render()}</div>

                <div className={cx('mt-7 flex items-end justify-between gap-5', wide && 'lg:mt-0 lg:w-1/2')}>
                  <div>
                    <p
                      className={cx(
                        'font-mono text-[11px] tracking-[0.28em]',
                        pearl ? 'text-[#b3267f]' : 'text-blush-300',
                      )}
                    >
                      0{i + 1}
                    </p>
                    <h3
                      className={cx(
                        'mt-2 font-serif font-bold leading-tight',
                        wide ? 'text-[2.2rem] md:text-[3.25rem]' : 'text-[1.9rem] md:text-[2.3rem]',
                        pearl ? 'text-night-800' : 'text-mist-50',
                      )}
                    >
                      {entry.title}
                    </h3>
                    <p
                      className={cx(
                        'mt-2.5 max-w-sm text-sm leading-7 md:text-[15px]',
                        wide && 'md:text-base md:leading-8',
                        pearl ? 'text-night-600' : wide ? 'text-mist-100' : 'text-mist-300',
                      )}
                    >
                      <Phrases text={entry.desc} by="。" />
                    </p>
                  </div>
                  <span
                    aria-label={entry.cta}
                    className={cx(
                      'grid size-13 shrink-0 place-items-center rounded-full transition-[translate,background-color] duration-500 ease-soft group-hover:translate-x-1',
                      pearl
                        ? 'bg-night-800 text-blush-100 group-hover:bg-night-700'
                        : 'border border-white/20 bg-white/8 text-mist-50 group-hover:bg-white/16',
                    )}
                  >
                    <ArrowRight className="size-5" />
                  </span>
                </div>
              </Link>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
