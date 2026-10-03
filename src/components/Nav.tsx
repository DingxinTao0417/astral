import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router'
import { brand, nav } from '../content/site'
import { cx } from '../lib/cx'
import { gsap, ScrollTrigger, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/hooks'
import { scroller } from '../lib/scroll'
import { stage } from '../lib/stage'
import { Magnet } from './bits/Magnet'
import { ArrowUpRight, Close, Menu, Sparkle } from './Icons'
import { TLink } from './motion/Transition'

const MENU = [{ to: '/', label: '首页' }, ...nav]

/** 离页面顶部多少像素以内算「在顶部」。取得很小：一开始往下滚导航就收起，不在首屏的大标题上停留 */
const TOP_ZONE = 24

export function Nav() {
  const { pathname } = useLocation()
  /** 导航正「浮」在正文上面（不在页面顶部，而且没有收起）：这时才带深色玻璃底 */
  const [floating, setFloating] = useState(false)
  const [open, setOpen] = useState(false)
  const header = useRef<HTMLElement>(null)
  const progress = useRef<HTMLDivElement>(null)
  const bar = useRef<HTMLElement>(null)
  const links = useRef<HTMLUListElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const menuTimeline = useRef<gsap.core.Timeline | null>(null)
  const openRef = useRef(open)

  useEffect(() => {
    openRef.current = open
  }, [open])

  // ── 进场、阅读进度、下滑隐藏 / 上滑出现 ──
  useGSAP(
    () => {
      if (!bar.current || !progress.current) return
      const still = prefersReducedMotion()

      gsap.fromTo(
        progress.current,
        { scaleX: 0 },
        { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: still ? true : 0.4 } },
      )

      // 三种状态：
      // 在页面顶部 —— 透明地叠在页头上；
      // 往下读 —— 整条收上去把画面让出来（不收的话，它会变成一条深色横条压在首屏的大标题上）；
      // 往回滚 —— 落下来，带一层深色玻璃底，随时可以换页
      const hide = gsap.to(bar.current, { yPercent: -170, duration: 0.5, ease: 'power3.inOut', paused: true })
      ScrollTrigger.create({
        start: 0,
        end: 'max',
        onUpdate: (self) => {
          const atTop = self.scroll() <= TOP_ZONE
          const hidden = !still && !atTop && self.direction > 0 && !openRef.current
          if (hidden) hide.play()
          else hide.reverse()
          setFloating(!atTop && !hidden)
        },
      })

      if (still) return
      // 第一次进站：幕布拉开后导航从上面落下来
      gsap.set('[data-nav-intro]', { yPercent: -140, autoAlpha: 0 })
      return stage.whenOpen(() => {
        gsap.to('[data-nav-intro]', { yPercent: 0, autoAlpha: 1, duration: 1.2, delay: 0.35 })
      })
    },
    { scope: header },
  )

  // ── 当前页的指示条：在几个导航项之间滑动 ──
  const placePill = useRef<(slide: boolean) => void>(() => {})

  useGSAP(
    () => {
      const list = links.current
      const el = pill.current
      if (!list || !el) return
      let shown = false
      placePill.current = (slide) => {
        const active = list.querySelector<HTMLElement>('[aria-current="page"]')
        if (!active) {
          shown = false
          gsap.to(el, { autoAlpha: 0, duration: 0.3, ease: 'power1.out', overwrite: true })
          return
        }
        const move = { x: active.offsetLeft, width: active.offsetWidth }
        // 从「没有选中项」到有的时候直接出现在位置上，不从别处滑过来
        const jump = !slide || !shown || prefersReducedMotion()
        if (jump) gsap.set(el, move)
        gsap.to(el, { ...move, autoAlpha: 1, duration: jump ? 0.3 : 0.7, ease: 'silk', overwrite: true })
        shown = true
      }
      // 字体加载完、窗口变宽变窄，导航项的宽度会变
      const resizer = new ResizeObserver(() => placePill.current(false))
      resizer.observe(list)
      return () => resizer.disconnect()
    },
    { scope: header },
  )

  useEffect(() => placePill.current(true), [pathname])

  // ── 手机端全屏菜单 ──
  useGSAP(
    () => {
      const timeline = gsap
        .timeline({ paused: true, defaults: { ease: 'silk' } })
        .set('#mobile-menu', { visibility: 'visible' })
        .fromTo(
          '#mobile-menu',
          { clipPath: 'circle(0% at calc(100% - 2.75rem) 2.5rem)' },
          { clipPath: 'circle(150% at calc(100% - 2.75rem) 2.5rem)', duration: 0.9, ease: 'curtain' },
        )
        .fromTo('[data-menu-item]', { yPercent: 115 }, { yPercent: 0, duration: 0.9, stagger: 0.06 }, 0.25)
        .fromTo('[data-menu-foot]', { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.6)
      if (prefersReducedMotion()) timeline.duration(0.01)
      menuTimeline.current = timeline
    },
    { scope: header },
  )

  useEffect(() => {
    const timeline = menuTimeline.current
    if (!timeline) return
    if (open) timeline.timeScale(1).play()
    else timeline.timeScale(1.7).reverse()
    if (!open) return
    scroller.lock()
    return () => scroller.unlock()
  }, [open])

  // 换页后收起手机菜单
  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header ref={header} className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      {/* 阅读进度 */}
      <div
        ref={progress}
        aria-hidden="true"
        className="absolute inset-x-0 top-0 z-10 h-0.5 origin-left bg-linear-to-r from-blush-400 via-iris-300 to-iris-500"
        style={{ transform: 'scaleX(0)' }}
      />

      {/* 浮在正文上时，顶上压一层往下渐隐的深色：正文从导航后面经过时不会从上沿露出半截 */}
      <div
        aria-hidden="true"
        className={cx(
          'pointer-events-none absolute inset-x-0 top-0 -z-10 h-32 bg-linear-to-b from-night-950/90 via-night-950/55 to-transparent transition-opacity duration-500',
          floating && !open ? 'opacity-100' : 'opacity-0',
        )}
      />

      {/* 手机端的全屏菜单：从右上角的按钮位置一圈圈展开 */}
      <div
        id="mobile-menu"
        data-lenis-prevent
        className="invisible fixed inset-0 -z-10 flex flex-col overflow-y-auto bg-night-900 px-6 pb-8 pt-24 md:hidden"
      >
        <div aria-hidden="true" className="hero-sky pointer-events-none absolute inset-0 -z-10 opacity-60" />
        <ul className="my-auto">
          {MENU.map((item, i) => (
            <li key={item.to} className="overflow-hidden border-b border-white/10">
              <TLink
                to={item.to}
                data-menu-item
                aria-current={pathname === item.to ? 'page' : undefined}
                className={cx(
                  'flex items-baseline justify-between py-4 font-serif text-[2.6rem] font-bold leading-tight active:opacity-70',
                  pathname === item.to ? 'text-aurora' : 'text-mist-50',
                )}
              >
                {item.label}
                <span className="font-mono text-[11px] font-normal tracking-[0.2em] text-mist-400 [-webkit-text-fill-color:currentColor]">
                  0{i}
                </span>
              </TLink>
            </li>
          ))}
        </ul>
        <p data-menu-foot className="mt-8 flex items-center gap-2.5 text-sm leading-6 text-mist-300">
          <Sparkle className="size-2.5 shrink-0 text-blush-400" />
          {brand.slogan}
        </p>
      </div>

      <div data-nav-intro>
        <nav
          ref={bar}
          aria-label="主导航"
          className={cx(
            'mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border pl-5 pr-2 transition-[background-color,border-color,box-shadow] duration-500',
            floating && !open
              ? 'border-white/12 bg-night-900/70 shadow-[0_20px_50px_-30px_rgb(7_2_22/0.9)] backdrop-blur-xl'
              : 'border-transparent',
          )}
        >
          <TLink
            to="/"
            className="group -ml-2.5 flex items-center gap-2.5 font-display text-[1.65rem] italic leading-none text-mist-50"
          >
            {/* logo：抖音头像，外面一圈镭射描边 */}
            <span className="rounded-full bg-[conic-gradient(from_140deg,#ffa3d5,#cdb5ff,#9be8ff,#ffe6f4,#ff78bf,#ad8cff,#ffd9c2,#ffa3d5)] p-[1.5px] transition-transform duration-500 ease-soft group-hover:scale-110 group-hover:-rotate-6">
              <img
                src="/media/avatar.webp"
                width={320}
                height={320}
                alt=""
                className="size-9 rounded-full bg-night-900 object-cover"
              />
            </span>
            {brand.name}
          </TLink>

          {/* 在页面顶部时导航项自己有一层深色玻璃底：首屏的光环正好从它后面经过，没有这层字会被光吃掉。
              整条导航浮起来、自己有了底之后，这层就撤掉，免得「胶囊套胶囊」 */}
          <ul
            ref={links}
            className={cx(
              'relative hidden items-center gap-1 rounded-full border p-1 transition-[background-color,border-color] duration-500 md:flex',
              floating ? 'border-transparent' : 'border-white/8 bg-night-950/40 backdrop-blur-md',
            )}
          >
            <li aria-hidden="true" className="pointer-events-none absolute inset-y-1 left-0">
              <span ref={pill} className="invisible block h-full rounded-full bg-white/12" />
            </li>
            {nav.map((item) => {
              const active = pathname === item.to
              return (
                <li key={item.to}>
                  <TLink
                    to={item.to}
                    aria-current={active ? 'page' : undefined}
                    className={cx(
                      'group relative block overflow-hidden rounded-full px-4 py-2 text-sm transition-colors duration-300',
                      active ? 'text-white' : 'text-mist-300 hover:text-white',
                    )}
                  >
                    {/* 鼠标移上去时文字向上翻一格 */}
                    <span className="block transition-transform duration-500 ease-soft group-hover:-translate-y-[160%]">
                      {item.label}
                    </span>
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 grid translate-y-[160%] place-items-center text-blush-200 transition-transform duration-500 ease-soft group-hover:translate-y-0"
                    >
                      {item.label}
                    </span>
                  </TLink>
                </li>
              )
            })}
          </ul>

          <div className="flex items-center gap-1.5">
            <Magnet padding={30} strength={0.3}>
              <a href={brand.douyinUrl} target="_blank" rel="noreferrer" className="btn btn-primary h-10 px-4 text-sm">
                抖音
                <ArrowUpRight className="size-4" />
              </a>
            </Magnet>
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
      </div>
    </header>
  )
}
