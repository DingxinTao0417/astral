import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router'
import { brand, nav } from '../content/site'
import { cx } from '../lib/cx'
import { ArrowUpRight, Close, Menu, Sparkle } from './Icons'

export function Nav() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const progress = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrolled(y > 24)
      if (progress.current) progress.current.style.scale = `${max > 0 ? Math.min(1, y / max) : 0} 1`
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  // 换页后收起手机菜单
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      {/* 阅读进度 */}
      <div
        ref={progress}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-linear-to-r from-blush-400 via-iris-300 to-iris-500"
        style={{ scale: '0 1' }}
      />

      <nav
        aria-label="主导航"
        className={cx(
          'mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border pl-5 pr-2 transition-[background-color,border-color,box-shadow] duration-500',
          scrolled || open
            ? 'border-white/12 bg-night-900/65 shadow-[0_20px_50px_-30px_rgb(7_2_22/0.9)] backdrop-blur-xl'
            : 'border-transparent',
        )}
      >
        <Link
          to="/"
          className="group flex items-center gap-2 font-display text-[1.65rem] italic leading-none text-mist-50"
        >
          <Sparkle className="size-3.5 text-blush-400 transition-transform duration-700 ease-soft group-hover:rotate-180" />
          {brand.name}
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {nav.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cx(
                    'rounded-full px-4 py-2 text-sm transition-colors',
                    isActive ? 'bg-white/12 text-white' : 'text-mist-300 hover:bg-white/8 hover:text-white',
                  )
                }
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-1.5">
          <a href={brand.douyinUrl} target="_blank" rel="noreferrer" className="btn btn-primary h-10 px-4 text-sm">
            抖音
            <ArrowUpRight className="size-4" />
          </a>
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-mist-50 transition-colors hover:bg-white/10 md:hidden"
            aria-label={open ? '关闭菜单' : '打开菜单'}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <Close className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {open && (
        <ul
          id="mobile-menu"
          className="rise mx-auto mt-2 max-w-6xl rounded-[1.75rem] border border-white/12 bg-night-900/88 p-3 backdrop-blur-xl md:hidden"
          style={{ animationDuration: '0.45s' }}
        >
          {[{ to: '/', label: '首页' }, ...nav].map((item, i) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end
                className={({ isActive }) =>
                  cx(
                    'flex items-baseline justify-between rounded-2xl px-4 py-3.5 font-serif text-2xl font-bold active:bg-white/8',
                    isActive ? 'text-blush-300' : 'text-mist-50',
                  )
                }
              >
                {item.label}
                <span className="font-mono text-[11px] font-normal tracking-[0.2em] text-mist-500">0{i}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </header>
  )
}
