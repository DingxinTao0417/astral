import type { ReactNode } from 'react'
import { experience } from '../content/site'
import { cx } from '../lib/cx'
import { trackSpotlight, useInView } from '../lib/hooks'
import { ArrowRight, ArrowUpRight, Play } from './Icons'
import { Reveal } from './Reveal'

/** 「经历」页的正文：四张卡片 */
export function Experience() {
  return (
    <section className="mx-auto grid max-w-6xl gap-4 px-5 pb-16 md:gap-5 md:pb-24 lg:grid-cols-12">
      <Creator />
      <Sales />
      <Growth />
      <Film />
    </section>
  )
}

interface CardProps {
  label: string
  title: string
  body: string
  className?: string
  delay?: number
  /** 浅色珠光版，用来在一片深色里提亮 */
  pearl?: boolean
  children: ReactNode
}

function Card({ label, title, body, className, delay, pearl, children }: CardProps) {
  return (
    <Reveal className={className} delay={delay}>
      <article
        className={cx('flex h-full flex-col overflow-hidden p-7 md:p-10', pearl ? 'card-pearl' : 'card spot')}
        onPointerMove={pearl ? undefined : trackSpotlight}
      >
        <p
          className={cx(
            'font-mono text-[11px] uppercase tracking-[0.28em]',
            pearl ? 'text-[#b3267f]' : 'text-blush-300',
          )}
        >
          {label}
        </p>
        <h2
          className={cx(
            'mt-4 font-serif text-[2rem] font-bold leading-tight md:text-[2.4rem]',
            pearl ? 'text-night-800' : 'text-mist-50',
          )}
        >
          {title}
        </h2>
        <p className={cx('mt-3 max-w-md text-pretty text-[15px] leading-8', pearl ? 'text-night-600' : 'text-mist-300')}>
          {body}
        </p>
        {children}
      </article>
    </Reveal>
  )
}

/* 做内容十年：B 站数据 */
function Creator() {
  const { creator } = experience
  return (
    <Card label="Creator" title={creator.title} body={creator.body} className="lg:col-span-7">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-8 right-4 select-none font-display text-[12rem] italic leading-none text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.16)] md:text-[16rem]"
      >
        10
      </span>
      <dl className="mt-auto grid gap-x-6 pt-10 sm:grid-cols-3">
        {creator.stats.map((s) => (
          <div
            key={s.label}
            className="flex items-baseline justify-between gap-4 border-t border-white/12 py-4 sm:flex-col-reverse sm:justify-end sm:gap-2.5 sm:pb-0 sm:pt-5"
          >
            <dt className="text-[13px] leading-5 text-mist-300">{s.label}</dt>
            <dd className="font-display text-[2.8rem] leading-none sm:text-[clamp(2.6rem,4.8vw,3.75rem)]">
              <span className="text-aurora">{s.value}</span>
              <span className="ml-1 text-[0.36em] font-bold text-blush-200">{s.unit}</span>
            </dd>
          </div>
        ))}
      </dl>
    </Card>
  )
}

/* 内容能卖货：270% 画成转了 2.7 圈的进度环 */
function Sales() {
  const { sales } = experience
  return (
    <Card pearl label="Commerce" title={sales.title} body={sales.body} className="lg:col-span-5" delay={120}>
      <div className="mt-auto flex justify-center pt-8">
        <GoalRing percent={sales.percent} caption={sales.caption} />
      </div>
    </Card>
  )
}

function GoalRing({ percent, caption }: { percent: number; caption: string }) {
  const [ref, inView] = useInView<HTMLDivElement>()
  const laps = [86, 68, 50].map((r, i) => ({
    r,
    length: 2 * Math.PI * r,
    fill: Math.max(0, Math.min(1, percent / 100 - i)),
  }))

  return (
    <div ref={ref} className="relative size-56">
      <svg viewBox="0 0 200 200" className="size-full -rotate-90" aria-hidden="true">
        <defs>
          <linearGradient id="goal-ring" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#6a3df0" />
            <stop offset="0.55" stopColor="#d245d8" />
            <stop offset="1" stopColor="#ff4fa8" />
          </linearGradient>
        </defs>
        {laps.map(({ r, length, fill }, i) => (
          <g key={r} fill="none" strokeWidth="11">
            <circle cx="100" cy="100" r={r} stroke="rgb(46 20 105 / 0.1)" />
            <circle
              cx="100"
              cy="100"
              r={r}
              stroke="url(#goal-ring)"
              strokeLinecap="round"
              strokeDasharray={length}
              strokeDashoffset={inView ? length * (1 - fill) : length}
              opacity={1 - i * 0.18}
              style={{ transition: `stroke-dashoffset 1.2s cubic-bezier(0.2, 0.7, 0.2, 1) ${0.2 + i * 0.55}s` }}
            />
          </g>
        ))}
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <p className="text-orchid font-display text-[2.9rem] leading-none">
          {percent}
          <span className="text-[0.55em]">%</span>
        </p>
        <p className="mt-1 text-[10px] tracking-wide text-night-600">{caption}</p>
      </div>
    </div>
  )
}

/* 会起号：两次从小到大 */
function Growth() {
  const { growth } = experience
  return (
    <Card label="Growth" title={growth.title} body={growth.body} className="lg:col-span-5">
      <ul className="mt-auto pt-7">
        {growth.rows.map((row, i) => (
          <li key={row.label} className={cx('border-t border-white/12 py-5', i === growth.rows.length - 1 && 'pb-0')}>
            <p className="flex items-center gap-3 font-display leading-none">
              <span className="text-[1.7rem] text-mist-400">{row.from}</span>
              <ArrowRight className="size-5 text-blush-300" />
              <span className="text-aurora text-[3.1rem]">
                {row.to}
                <span className="ml-0.5 text-[0.4em] font-bold">{row.unit}</span>
              </span>
              <span className="chip ml-auto py-1 text-xs">{row.note}</span>
            </p>
            <p className="mt-3 flex flex-wrap items-center gap-x-3 text-[13px] text-mist-300">
              {row.label}
              {row.href && (
                <a
                  href={row.href}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-blush-300 underline-offset-4 hover:underline"
                >
                  去看看
                  <ArrowUpRight className="size-3.5" />
                </a>
              )}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  )
}

/* 影像是老本行：《守护》 */
function Film() {
  const { film } = experience
  return (
    <Card label="Film" title={film.title} body={film.body} className="lg:col-span-7" delay={120}>
      <div aria-hidden="true" className="sprockets absolute inset-x-7 top-3 opacity-70 md:inset-x-10" />
      <a href={film.href} target="_blank" rel="noreferrer" className="group mt-auto flex items-center gap-5 pt-10">
        <span className="btn btn-primary size-16 shrink-0 group-hover:-translate-y-0.5">
          <Play className="ml-0.5 size-6" />
        </span>
        <span>
          <span className="block font-serif text-[1.85rem] font-bold leading-tight text-mist-50">{film.work}</span>
          <span className="mt-1 inline-flex items-center gap-1 text-sm text-mist-300 transition-colors group-hover:text-blush-300">
            {film.cta}
            <ArrowUpRight className="size-4" />
          </span>
        </span>
      </a>
      <div aria-hidden="true" className="sprockets absolute inset-x-7 bottom-3 opacity-70 md:inset-x-10" />
    </Card>
  )
}
