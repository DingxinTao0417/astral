import type { CSSProperties } from 'react'
import { Link } from 'react-router'
import { brand, hero, tools } from '../content/site'
import { Aurora } from './Aurora'
import { Stars } from './Backdrop'
import { Holo } from './Holo'
import { ArrowRight, ArrowUpRight, Sparkle } from './Icons'
import { Img } from './Img'
import { Phrases } from './Phrases'

const delay = (ms: number) => ({ '--d': `${ms}ms` }) as CSSProperties

export function Hero() {
  return (
    <>
      <section className="relative isolate flex min-h-svh flex-col overflow-hidden">
        <div aria-hidden="true" className="sky-fade absolute inset-0 -z-10">
          <Aurora className="absolute inset-0" />
          <Stars count={56} seed={7} className="absolute inset-0" />
          <div className="grain absolute inset-0" />
        </div>

        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center justify-center px-5 pb-12 pt-24 text-center">
          <h1 className="relative">
            {/* 标题背后的一团柔光，把字从极光里托出来 */}
            <span
              aria-hidden="true"
              className="absolute left-1/2 top-[38%] -z-10 aspect-[2/1] w-[130%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(12_4_35/0.55),transparent)]"
            />
            <span
              className="bloom relative inline-block bg-[length:220%_100%] px-[0.06em] font-display text-[clamp(5.5rem,min(35vw,31svh),19rem)] italic leading-[0.84] text-aurora animate-[bloom_1.3s_var(--ease-soft)_both,sheen_9s_ease-in-out_1.3s_infinite_alternate]"
              style={delay(100)}
            >
              {brand.name}
              <span className="flare -right-[0.07em] top-[0.03em]">
                <span className="flare-glow" />
                <span className="flare-ray" />
                <span className="flare-ray flare-ray-v" />
                <Sparkle className="flare-star" />
              </span>
            </span>
            <span
              className="rise mt-4 block pl-[0.14em] font-serif text-[clamp(2rem,min(8.6vw,9svh),4.75rem)] font-bold leading-tight tracking-[0.14em] text-mist-50 [text-shadow:0_2px_40px_rgb(12_4_35/0.6)]"
              style={delay(320)}
            >
              {brand.cnName}
            </span>
          </h1>

          <p
            className="rise mt-[clamp(1.25rem,3.4svh,2.25rem)] flex items-center gap-4 pl-[0.2em] text-base font-medium tracking-[0.2em] text-mist-50 md:text-xl"
            style={delay(440)}
          >
            <span aria-hidden="true" className="hidden h-px w-10 bg-linear-to-r from-transparent to-blush-300 sm:block" />
            {brand.slogan.replace(/。$/, '')}
            <span aria-hidden="true" className="hidden h-px w-10 bg-linear-to-l from-transparent to-blush-300 sm:block" />
          </p>
          <p
            className="rise mt-3 max-w-xl text-balance text-[15px] leading-8 text-mist-300 md:text-base"
            style={delay(520)}
          >
            <Phrases text={hero.intro} by={['。', '，']} />
          </p>

          <div
            className="rise mt-[clamp(1.5rem,4svh,2.25rem)] flex flex-wrap items-center justify-center gap-3"
            style={delay(620)}
          >
            <a href={brand.douyinUrl} target="_blank" rel="noreferrer" className="btn btn-primary h-13 px-7 text-[15px]">
              {hero.primaryCta}
              <ArrowUpRight className="size-4" />
            </a>
            <Link to="/works" className="btn btn-ghost h-13 px-7 text-[15px]">
              {hero.secondaryCta}
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>

        <Fan />
      </section>

      <Marquee items={tools} />
    </>
  )
}

/** 首屏底部扇形排开的镭射作品卡，下半截藏在屏幕外，鼠标移上去会抽出来 */
function Fan() {
  const middle = (hero.fan.length - 1) / 2
  return (
    <div className="fan">
      {hero.fan.map((card, i) => {
        const offset = i - middle
        return (
          <Link
            key={card.id}
            to={card.to}
            aria-label={`${card.label}，查看作品`}
            className="fan-card rounded-[1.1rem]"
            style={
              {
                '--o': offset,
                '--abs': Math.abs(offset),
                '--d': `${700 + Math.abs(offset) * 140}ms`,
                zIndex: 10 - Math.abs(offset),
              } as CSSProperties
            }
          >
            <Holo>
              <Img id={card.id} alt="" variant="sm" eager className="aspect-3/4 w-full object-cover" />
              <span className="absolute left-2 top-2 z-3 rounded-full bg-night-900/70 px-2 py-0.5 text-[10px] leading-4 tracking-wide text-mist-50 backdrop-blur-sm md:left-2.5 md:top-2.5 md:px-2.5 md:text-[11px]">
                {card.label}
              </span>
            </Holo>
          </Link>
        )
      })}
    </div>
  )
}

/** 首屏下方无限滚动的工具条 */
function Marquee({ items }: { items: string[] }) {
  const row = (hidden: boolean) => (
    <ul aria-hidden={hidden} className="flex shrink-0 items-center">
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
  )
  return (
    <div className="relative z-10 border-y border-white/10 bg-night-900/70 py-4 backdrop-blur-md">
      <div className="fade-x overflow-hidden">
        <div className="animate-marquee flex w-max">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  )
}
