import { useRef } from 'react'
import { brand, contact, nav } from '../content/site'
import { gsap, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/hooks'
import { stage } from '../lib/stage'
import { Magnet } from './bits/Magnet'
import { SplitText } from './bits/SplitText'
import { ArrowUpRight, Sparkle } from './Icons'
import { TLink } from './motion/Transition'
import { VelocityMarquee } from './motion/VelocityMarquee'
import { Phrases } from './Phrases'

export function Contact() {
  const root = useRef<HTMLElement>(null)

  useGSAP(
    (_, contextSafe) => {
      if (!root.current || prefersReducedMotion()) return
      const q = gsap.utils.selector(root.current)
      const card = q('[data-cta-card]')[0]
      gsap.set(card, { autoAlpha: 0, y: 90, scale: 0.94 })
      gsap.set(q('[data-cta-in]'), { autoAlpha: 0, y: 30 })
      return stage.whenOpen(
        contextSafe!(() => {
          gsap
            .timeline({ scrollTrigger: { trigger: card, start: 'top 92%', once: true } })
            .to(card, { autoAlpha: 1, y: 0, scale: 1, duration: 1.3 }, 0)
            .to(q('[data-cta-in]'), { autoAlpha: 1, y: 0, duration: 1.1, stagger: 0.09 }, 0.35)
          // 卡片里的几颗星跟着滚动上下错开一点
          gsap.to(q('[data-cta-star]'), {
            yPercent: (i) => (i % 2 ? 160 : -160),
            ease: 'none',
            scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true },
          })
        }),
      )
    },
    { scope: root },
  )

  return (
    <footer ref={root} id="contact" className="overflow-x-clip pt-10 md:pt-16">
      <div className="px-3 md:px-5">
        <div
          data-cta-card
          className="card relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] px-6 py-16 text-center md:py-24"
        >
          <div aria-hidden="true" className="hero-sky absolute inset-0 -z-10 opacity-75" />
          <span data-cta-star className="absolute left-[9%] top-[16%]">
            <Sparkle className="animate-spin-slow size-5 text-blush-200/70" />
          </span>
          <span data-cta-star className="absolute right-[11%] top-[24%]">
            <Sparkle className="animate-float size-3.5 text-iris-200/70" />
          </span>
          <span data-cta-star className="absolute bottom-[18%] left-[16%]">
            <Sparkle className="animate-float size-3 text-iris-200/60 [animation-delay:-4s]" />
          </span>
          <span data-cta-star className="absolute bottom-[14%] right-[14%]">
            <Sparkle className="animate-spin-slow size-6 text-blush-200/50" />
          </span>

          <p data-cta-in className="eyebrow justify-center">
            {contact.eyebrow}
          </p>
          <SplitText
            tag="h2"
            wait={0.2}
            className="mx-auto mt-6 max-w-3xl font-serif text-[clamp(2rem,6.4vw,4rem)] font-bold leading-[1.2] text-mist-50"
          >
            <Phrases text={contact.title} />
          </SplitText>
          <p data-cta-in className="mx-auto mt-4 max-w-md text-[15px] leading-8 text-mist-300 md:text-base">
            <Phrases text={contact.body} />
          </p>

          {/* 抖音头像，套一圈镭射描边，方便访客在抖音里认出账号 */}
          <div
            data-cta-in
            className="mx-auto mt-10 size-24 rounded-full bg-[conic-gradient(from_140deg,#ffa3d5,#cdb5ff,#9be8ff,#ffe6f4,#ff78bf,#ad8cff,#ffd9c2,#ffa3d5)] p-[2.5px] shadow-[0_20px_50px_-15px_rgb(255_79_168/0.8)] md:size-28"
          >
            <img
              src="/media/avatar.webp"
              width={320}
              height={320}
              alt={`${brand.account}的抖音头像`}
              loading="lazy"
              decoding="async"
              className="size-full rounded-full bg-night-900 object-cover"
            />
          </div>
          <p
            data-cta-in
            className="mt-5 font-display text-[clamp(1.75rem,6.6vw,3.25rem)] leading-tight text-mist-50"
          >
            <span className="text-aurora pr-[0.08em] italic">{brand.name}</span>
            <span className="font-semibold tracking-[0.06em]">{brand.cnName}</span>
          </p>

          <div data-cta-in className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Magnet padding={70} strength={0.4}>
              <a
                href={brand.douyinUrl}
                target="_blank"
                rel="noreferrer"
                className="btn btn-primary h-13 px-7 text-[15px]"
              >
                {contact.openCta}
                <ArrowUpRight className="size-4" />
              </a>
            </Magnet>
          </div>
        </div>
      </div>

      {/* 页脚的巨型品牌字幕：一句渐变、一句空心，交替出现；页面滚得越快它走得越快，还会跟着倾斜 */}
      <div aria-hidden="true" className="mt-10 select-none md:mt-16">
        <VelocityMarquee speed={70} boost={3.5} skew={7} copies={3}>
          <p className="flex shrink-0 items-center font-display text-[clamp(4.5rem,15vw,12.5rem)] leading-[1.1]">
            <span className="text-aurora px-[0.14em] italic">{brand.name}</span>
            <Sparkle className="mx-[0.16em] size-[0.2em] shrink-0 text-blush-300" />
            <span className="text-outline font-serif text-[0.74em] font-black">{brand.cnName}</span>
            <Sparkle className="mx-[0.16em] size-[0.2em] shrink-0 text-blush-300" />
          </p>
        </VelocityMarquee>
      </div>

      <div className="mx-auto mt-6 flex max-w-6xl flex-col items-center justify-between gap-5 px-6 pb-8 text-xs text-mist-500 md:mt-10 md:flex-row md:px-8">
        <TLink to="/" className="flex items-center gap-2 font-display text-xl italic text-mist-300">
          <img
            src="/media/avatar.webp"
            width={320}
            height={320}
            alt=""
            loading="lazy"
            className="size-7 rounded-full object-cover ring-1 ring-white/25"
          />
          {brand.name}
        </TLink>
        <ul className="flex gap-6">
          {nav.map((item) => (
            <li key={item.to}>
              <TLink to={item.to} className="transition-colors hover:text-mist-100">
                {item.label}
              </TLink>
            </li>
          ))}
        </ul>
        <p>
          © {new Date().getFullYear()} {brand.account}
        </p>
      </div>
    </footer>
  )
}
