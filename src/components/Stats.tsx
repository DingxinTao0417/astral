import { stats } from '../content/site'
import { CountUp } from './CountUp'
import { Sparkle } from './Icons'
import { Reveal } from './Reveal'

/** 关键数据：不装框，大号数字直接排在夜空上 */
export function Stats() {
  return (
    <section aria-label="关键数据" className="mx-auto max-w-6xl px-5 py-16 md:py-28">
      <ul className="grid grid-cols-2 gap-x-5 gap-y-12 md:grid-cols-4 md:gap-x-0">
        {stats.map((s, i) => (
          <li key={s.label} className="md:border-l md:border-white/12 md:pl-7 md:first:border-l-0 md:first:pl-0">
            <Reveal delay={i * 90}>
              <p className="flex items-center gap-2 font-mono text-[11px] tracking-[0.24em] text-mist-500">
                <Sparkle className="size-2.5 text-blush-400" />0{i + 1}
              </p>
              <p className="mt-4 flex items-baseline font-display text-[clamp(4rem,8.6vw,6.75rem)] leading-[0.82]">
                <span className="text-aurora inline-block">
                  <CountUp to={s.value} />
                </span>
                <span className="ml-1.5 text-[0.32em] font-bold text-blush-200">{s.unit}</span>
              </p>
              <p className="mt-5 text-sm text-mist-300 md:text-[15px]">{s.label}</p>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}
