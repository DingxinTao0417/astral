import { about, brand } from '../content/site'
import { Sparkle } from './Icons'
import { Img } from './Img'
import { Reveal } from './Reveal'

/** 「关于」页的正文：拱形相框 + 自述 + 工具清单。第一段自述放在页头，这里从第二段开始 */
export function About() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 md:pb-24">
      <div className="grid items-start gap-14 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20">
        <Reveal className="relative mx-auto w-[min(76vw,340px)] lg:w-full lg:max-w-100">
          {/* 拱形相框：外层镭射描边，内层照片 */}
          <div className="rounded-b-[2rem] rounded-t-full bg-[conic-gradient(from_140deg,#ffa3d5,#cdb5ff,#9be8ff,#ffe6f4,#ff78bf,#ad8cff,#ffd9c2,#ffa3d5)] p-[2px] shadow-[0_50px_120px_-45px_rgb(255_79_168/0.7)]">
            <div className="overflow-hidden rounded-b-[calc(2rem-2px)] rounded-t-full bg-night-800">
              <Img
                id={about.portrait}
                alt={`${brand.owner}的人像照片`}
                sizes="(min-width: 1024px) 400px, 76vw"
                className="aspect-3/4 w-full object-cover object-[50%_30%]"
              />
            </div>
          </div>
          <Badge />
          <p className="mt-4 flex items-center justify-center gap-2 text-xs tracking-[0.1em] text-mist-300">
            <Sparkle className="size-2.5 text-blush-400" />
            {about.portraitNote}
          </p>
        </Reveal>

        <div>
          <Reveal>
            <div className="space-y-5 text-pretty text-base leading-8 text-mist-300 md:text-lg md:leading-10">
              {about.paragraphs.slice(1).map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          </Reveal>

          <Reveal delay={120}>
            <dl className="mt-10 space-y-7 border-t border-white/12 pt-9">
              {about.kits.map((kit) => (
                <div key={kit.title} className="grid gap-3 sm:grid-cols-[7rem_1fr] sm:gap-4">
                  <dt className="pt-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-mist-400">
                    {kit.title}
                  </dt>
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
          </Reveal>
        </div>
      </div>
    </section>
  )
}

/** 相框角上缓慢旋转的圆形徽章 */
function Badge() {
  const text = `${brand.name} · Nova Lab · `.toUpperCase().repeat(2)
  return (
    <div
      aria-hidden="true"
      className="absolute -right-5 top-[58%] grid size-28 place-items-center rounded-full border border-white/15 bg-night-900/75 backdrop-blur-md md:-right-8 md:size-32"
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
  )
}
