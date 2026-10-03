import { Link } from 'react-router'
import { brand, contact, nav } from '../content/site'
import { ArrowUpRight, Sparkle } from './Icons'
import { Phrases } from './Phrases'
import { Reveal } from './Reveal'

export function Contact() {
  return (
    <footer id="contact" className="px-3 pb-8 pt-10 md:px-5 md:pt-16">
      <Reveal>
        <div className="card relative isolate mx-auto max-w-6xl overflow-hidden rounded-[2.25rem] px-6 py-16 text-center md:py-24">
          <div
            aria-hidden="true"
            className="hero-sky absolute inset-0 -z-10 opacity-75"
          />
          <Sparkle className="animate-spin-slow absolute left-[9%] top-[16%] size-5 text-blush-200/70" />
          <Sparkle className="animate-float absolute right-[11%] top-[24%] size-3.5 text-iris-200/70" />
          <Sparkle className="animate-float absolute bottom-[18%] left-[16%] size-3 text-iris-200/60 [animation-delay:-4s]" />
          <Sparkle className="animate-spin-slow absolute bottom-[14%] right-[14%] size-6 text-blush-200/50" />

          <p className="eyebrow justify-center">{contact.eyebrow}</p>
          <h2 className="mx-auto mt-6 max-w-3xl font-serif text-[clamp(2rem,6.4vw,4rem)] font-bold leading-[1.2] text-mist-50">
            <Phrases text={contact.title} />
          </h2>
          <p className="mx-auto mt-4 max-w-md text-[15px] leading-8 text-mist-300 md:text-base">
            <Phrases text={contact.body} />
          </p>

          {/* 抖音头像，套一圈镭射描边，方便访客在抖音里认出账号 */}
          <div className="mx-auto mt-10 size-24 rounded-full bg-[conic-gradient(from_140deg,#ffa3d5,#cdb5ff,#9be8ff,#ffe6f4,#ff78bf,#ad8cff,#ffd9c2,#ffa3d5)] p-[2.5px] shadow-[0_20px_50px_-15px_rgb(255_79_168/0.8)] md:size-28">
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
          <p className="mt-5 font-display text-[clamp(1.75rem,6.6vw,3.25rem)] leading-tight text-mist-50">
            <span className="text-aurora pr-[0.08em] italic">{brand.name}</span>
            <span className="font-semibold tracking-[0.06em]">{brand.cnName}</span>
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href={brand.douyinUrl}
              target="_blank"
              rel="noreferrer"
              className="btn btn-primary h-13 px-7 text-[15px]"
            >
              {contact.openCta}
              <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </Reveal>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-5 px-3 text-xs text-mist-500 md:flex-row">
        <Link to="/" className="flex items-center gap-2 font-display text-xl italic text-mist-300">
          <img
            src="/media/avatar.webp"
            width={320}
            height={320}
            alt=""
            loading="lazy"
            className="size-7 rounded-full object-cover ring-1 ring-white/25"
          />
          {brand.name}
        </Link>
        <ul className="flex gap-6">
          {nav.map((item) => (
            <li key={item.to}>
              <Link to={item.to} className="transition-colors hover:text-mist-100">
                {item.label}
              </Link>
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
