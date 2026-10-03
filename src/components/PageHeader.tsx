import { brand } from '../content/site'
import { Aurora } from './Aurora'
import { Stars } from './Backdrop'
import { Sparkle } from './Icons'
import { Phrases } from './Phrases'

interface PageHeaderProps {
  index: string
  eyebrow: string
  title: string
  intro?: string
}

/** 子页面的页头：一条矮一些的极光 + 大标题。同时负责设置浏览器标签页标题 */
export function PageHeader({ index, eyebrow, title, intro }: PageHeaderProps) {
  return (
    <header className="relative isolate overflow-hidden">
      <title>{`${title}｜${brand.account}`}</title>
      <div aria-hidden="true" className="sky-fade absolute inset-0 -z-10">
        <Aurora className="absolute inset-0" />
        <Stars count={36} seed={Number(index) * 31} className="absolute inset-0" />
        <div className="grain absolute inset-0" />
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-20 pt-36 md:pb-28 md:pt-44">
        <p className="eyebrow rise">
          <Sparkle className="size-3" />
          {index}
          <span className="h-px w-8 bg-white/25" />
          <span className="text-mist-300">{eyebrow}</span>
        </p>
        <h1
          className="bloom mt-6 font-serif text-[clamp(3rem,10vw,6.5rem)] font-bold leading-[1.08] text-mist-50 [text-shadow:0_2px_40px_rgb(12_4_35/0.55)]"
          style={{ animationDelay: '80ms' }}
        >
          {title}
        </h1>
        {intro && (
          <p
            className="rise mt-6 max-w-xl text-base leading-8 text-mist-100 md:text-lg md:leading-9"
            style={{ animationDelay: '220ms' }}
          >
            <Phrases text={intro} by={['。', '，']} />
          </p>
        )}
      </div>
    </header>
  )
}
