import { useState, type ReactNode } from 'react'
import { works } from '../content/site'
import { trackSpotlight } from '../lib/hooks'
import { CountUp } from './CountUp'
import { Holo } from './Holo'
import { ArrowRight, Drag, Expand } from './Icons'
import { Img } from './Img'
import { CompareSlider } from './works/CompareSlider'
import { FilmPhone } from './works/FilmPhone'
import { useLightbox } from './Lightbox'
import { Phrases } from './Phrases'
import { Reveal } from './Reveal'

/** 「作品」页的正文：两个 AI 项目 */
export function Works() {
  return (
    <section className="mx-auto max-w-6xl space-y-6 px-5 pb-16 md:space-y-10 md:pb-24">
      <FilmProject />
      <VisualProject />
    </section>
  )
}

/* ── 两个项目共用的外壳和小部件 ───────────────────────── */

function Shell({ index, children }: { index: string; children: ReactNode }) {
  return (
    <Reveal>
      <article className="card spot overflow-hidden" onPointerMove={trackSpotlight}>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-4 right-4 select-none font-display text-[8.5rem] italic leading-none text-transparent [-webkit-text-stroke:1px_rgb(255_255_255/0.16)] md:right-8 md:text-[13rem]"
        >
          {index}
        </span>
        <div className="relative p-6 sm:p-9 lg:p-14">{children}</div>
      </article>
    </Reveal>
  )
}

function Label({ index, tag }: { index: string; tag: string }) {
  return (
    <p className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.28em] text-blush-300">
      Project {index}
      <span className="h-px w-6 bg-white/25" />
      <span className="tracking-[0.16em] text-mist-300">{tag}</span>
    </p>
  )
}

function Title({ children }: { children: string }) {
  return (
    <h2 className="mt-5 font-serif text-[clamp(2rem,5.4vw,3.25rem)] font-bold leading-[1.2] text-mist-50">
      <Phrases text={children} />
    </h2>
  )
}

function Body({ children }: { children: ReactNode }) {
  return <p className="mt-5 text-pretty text-[15px] leading-8 text-mist-300 md:text-[17px] md:leading-9">{children}</p>
}

function SubTitle({ children }: { children: ReactNode }) {
  return <h3 className="font-mono text-[11px] uppercase tracking-[0.24em] text-mist-400">{children}</h3>
}

/* ── 项目 01：AIGC 商业视频 ───────────────────────────── */

function FilmProject() {
  const { film } = works
  const open = useLightbox()
  return (
    <Shell index="01">
      <div className="grid gap-x-14 gap-y-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:grid-rows-[auto_1fr]">
        <div className="lg:col-start-2">
          <Label index="01" tag={film.tag} />
          <Title>{film.title}</Title>
          <Body>{film.body}</Body>
          <ol className="mt-7 flex flex-wrap items-center gap-x-2 gap-y-2.5">
            {film.flow.map((stage, i) => (
              <li key={stage} className="flex items-center gap-2">
                {i > 0 && <ArrowRight className="size-3.5 text-blush-300" />}
                <span className="chip">{stage}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:self-center">
          <FilmPhone {...film.video} />
        </div>

        <div className="lg:col-start-2">
          <SubTitle>{film.shotsTitle}</SubTitle>
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {film.shots.map((shot, i) => (
              <li key={shot.id}>
                <button type="button" className="group block w-full text-left" onClick={() => open(film.shots, i)}>
                  <Holo className="holo-quiet" tilt={9}>
                    <Img id={shot.id} variant="sm" alt={shot.caption} className="aspect-3/2 w-full object-cover" />
                    <span className="absolute right-2 top-2 z-3 grid size-8 place-items-center rounded-full bg-night-900/75 text-mist-50 backdrop-blur-sm">
                      <Expand className="size-3.5" />
                    </span>
                  </Holo>
                  <span className="mt-3 block text-[13px] leading-5 text-mist-300 transition-colors group-hover:text-white">
                    {shot.caption}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </Shell>
  )
}

/* ── 项目 02：一张白底图，做完一套电商视觉 ────────────── */

function VisualProject() {
  const { visual } = works
  const [active, setActive] = useState(0)
  const open = useLightbox()
  const pair = visual.pairs[active]

  return (
    <Shell index="02">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,4fr)] lg:items-end lg:gap-12">
        <div>
          <Label index="02" tag={visual.tag} />
          <Title>{visual.title}</Title>
          <Body>{visual.body}</Body>
        </div>

        {/* 结果：一张浅色珠光小卡，在深色里跳出来 */}
        <div className="card-pearl w-full max-w-xs rounded-[1.5rem] px-6 py-5 lg:justify-self-end">
          <p className="text-orchid font-display text-[4.5rem] leading-[0.9]">
            <CountUp to={visual.result.value} />
            <span className="text-[0.5em]">{visual.result.unit}</span>
          </p>
          <p className="mt-2 text-sm font-medium text-night-700">{visual.result.label}</p>
          <p className="mt-1 text-xs text-night-600/70">{visual.credit}</p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {visual.pairs.map((p, i) => (
            <button
              key={p.name}
              type="button"
              className="chip px-4 py-2"
              aria-pressed={i === active}
              onClick={() => setActive(i)}
            >
              {p.name}
            </button>
          ))}
        </div>
        <p className="flex items-center gap-2 text-xs text-mist-400">
          <Drag className="size-4" />
          {visual.hint}
        </p>
      </div>
      <div className="mt-4">
        <CompareSlider
          key={pair.name}
          name={pair.name}
          before={pair.before}
          after={pair.after}
          beforeLabel={visual.before}
          afterLabel={visual.after}
        />
      </div>

      <div className="mt-12">
        <SubTitle>{visual.extrasTitle}</SubTitle>
        <ul className="mt-4 grid gap-4 sm:grid-cols-2 md:gap-5">
          {visual.extras.map((extra, i) => (
            <li key={extra.id}>
              <button type="button" className="group block w-full" onClick={() => open(visual.extras, i)}>
                <Holo className="holo-quiet" tilt={6}>
                  <Img
                    id={extra.id}
                    alt={extra.caption}
                    sizes="(min-width: 640px) 45vw, 92vw"
                    className="aspect-896/518 w-full object-cover"
                  />
                  <span className="absolute inset-x-0 bottom-0 z-3 rounded-b-[inherit] bg-linear-to-t from-black/80 to-transparent px-4 pb-3 pt-10 text-left text-[13px] text-mist-50">
                    {extra.caption}
                  </span>
                </Holo>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </Shell>
  )
}
