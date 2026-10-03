import { useState } from 'react'
import { Link } from 'react-router'
import { brand, contact, nav } from '../content/site'
import { ArrowUpRight, Check, Copy, Sparkle } from './Icons'
import { Phrases } from './Phrases'
import { Reveal } from './Reveal'

export function Contact() {
  const [copied, setCopied] = useState(false)

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(brand.douyinId)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      // 个别内嵌浏览器不给剪贴板权限：抖音号就显示在按钮上方，可以长按复制
    }
  }

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

          <p className="mt-10 font-display text-[clamp(1.75rem,6.6vw,3.25rem)] leading-tight text-mist-50">
            <span className="text-aurora pr-[0.08em] italic">{brand.name}</span>
            <span className="font-semibold tracking-[0.06em]">{brand.cnName}</span>
          </p>
          <p className="mt-3 text-sm text-mist-300">
            抖音号 <span className="select-all font-mono tracking-[0.12em] text-mist-50">{brand.douyinId}</span>
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
            <button type="button" className="btn btn-ghost h-13 px-7 text-[15px]" onClick={copyAccount}>
              {copied ? <Check className="size-4 text-blush-300" /> : <Copy className="size-4" />}
              <span aria-live="polite">{copied ? contact.copied : contact.copyCta}</span>
            </button>
          </div>
        </div>
      </Reveal>

      <div className="mx-auto mt-8 flex max-w-6xl flex-col items-center justify-between gap-5 px-3 text-xs text-mist-500 md:flex-row">
        <Link to="/" className="flex items-center gap-2 font-display text-xl italic text-mist-300">
          <Sparkle className="size-3 text-blush-400" />
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
          © {new Date().getFullYear()} {brand.account} · {brand.owner}
        </p>
      </div>
    </footer>
  )
}
