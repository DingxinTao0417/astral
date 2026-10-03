import { brand } from '../content/site'
import { cx } from '../lib/cx'
import { Sparkle } from './Icons'

/** 板块之间的巨型 slogan 滚动字幕：一句空心描边、一句渐变实心，交替出现 */
export function SloganBand() {
  const phrases = brand.slogan.replace(/。$/, '').split('，')

  const row = (hidden: boolean) => (
    <p aria-hidden={hidden} className="flex shrink-0 items-center">
      {[0, 1].map((round) =>
        phrases.map((phrase, i) => (
          <span key={`${round}-${i}`} className="flex items-center">
            <span className={cx('px-[0.28em]', i % 2 === 0 ? 'text-outline' : 'text-aurora')}>{phrase}</span>
            <Sparkle className="size-[0.3em] shrink-0 text-blush-300" />
          </span>
        )),
      )}
    </p>
  )

  return (
    <div
      role="img"
      aria-label={brand.slogan}
      className="overflow-x-clip py-10 md:py-16"
    >
      <div className="-rotate-2 scale-x-105">
        <div className="animate-marquee-slow flex w-max font-serif text-[clamp(3.25rem,11vw,8.5rem)] font-black leading-[1.15]">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  )
}
