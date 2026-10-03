import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { createPortal } from 'react-dom'
import { getMedia } from '../content/media'
import { gsap, useGSAP } from '../lib/gsap'
import { prefersReducedMotion } from '../lib/hooks'
import { scroller } from '../lib/scroll'
import { ChevronLeft, ChevronRight, Close } from './Icons'

export interface LightboxItem {
  id: string
  caption: string
}

type OpenLightbox = (items: LightboxItem[], index: number) => void

const LightboxContext = createContext<OpenLightbox>(() => {})

/** 返回 open(items, index)，点开大图用 */
export const useLightbox = () => useContext(LightboxContext)

/**
 * 页面上的缩略图加上 data-lightbox-thumb={素材 id}，大图就会从那张缩略图的位置「放大」出来，
 * 关闭时再缩回去。找不到（或者缩略图已经滚出屏幕）就退回普通的淡入淡出。
 */
function thumbOf(id: string) {
  const el = document.querySelector<HTMLElement>(`[data-lightbox-thumb="${id}"]`)
  if (!el) return null
  const rect = el.getBoundingClientRect()
  const visible = rect.bottom > 0 && rect.top < window.innerHeight && rect.width > 0
  return visible ? el : null
}

/** 让大图看起来正好盖在缩略图上，需要怎样的位移和缩放 */
function fitTo(img: HTMLElement, thumb: HTMLElement): gsap.TweenVars {
  // 按大图不带任何位移缩放时的位置来算
  const transform = img.style.transform
  img.style.transform = 'none'
  const from = img.getBoundingClientRect()
  img.style.transform = transform
  const to = thumb.getBoundingClientRect()
  return {
    x: to.left + to.width / 2 - (from.left + from.width / 2),
    y: to.top + to.height / 2 - (from.top + from.height / 2),
    scaleX: to.width / from.width,
    scaleY: to.height / from.height,
  }
}

export function LightboxProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ items: LightboxItem[]; index: number } | null>(null)
  const open = useCallback<OpenLightbox>((items, index) => setState({ items, index }), [])
  const close = useCallback(() => setState(null), [])
  const setIndex = useCallback((index: number) => setState((s) => s && { ...s, index }), [])

  return (
    <LightboxContext value={open}>
      {children}
      {state && <Lightbox {...state} onIndex={setIndex} onClose={close} />}
    </LightboxContext>
  )
}

interface LightboxProps {
  items: LightboxItem[]
  index: number
  onIndex: (index: number) => void
  onClose: () => void
}

function Lightbox({ items, index, onIndex, onClose }: LightboxProps) {
  const item = items[index]
  const m = getMedia(item.id)
  const many = items.length > 1
  const root = useRef<HTMLDivElement>(null)
  const image = useRef<HTMLImageElement>(null)
  const closeButton = useRef<HTMLButtonElement>(null)
  const touchX = useRef<number | null>(null)
  const closing = useRef(false)
  /** 上一次翻页的方向：1 下一张，-1 上一张，0 是刚打开 */
  const direction = useRef(0)

  const step = useCallback(
    (delta: number) => {
      direction.current = delta
      onIndex((index + delta + items.length) % items.length)
    },
    [index, items.length, onIndex],
  )

  /** 关闭：大图缩回缩略图的位置，背景同时淡出，播完再真正卸载 */
  const close = useCallback(() => {
    if (closing.current) return
    closing.current = true
    const el = root.current
    const img = image.current
    if (!el || !img || prefersReducedMotion()) {
      onClose()
      return
    }
    const thumb = thumbOf(item.id)
    const timeline = gsap.timeline({ onComplete: onClose })
    gsap.killTweensOf(img)
    if (thumb) {
      timeline.to(img, { ...fitTo(img, thumb), duration: 0.55, ease: 'power3.inOut' }, 0)
    } else {
      timeline.to(img, { autoAlpha: 0, scale: 0.94, duration: 0.3, ease: 'power2.out' }, 0)
    }
    timeline.to(el, { autoAlpha: 0, duration: 0.4, ease: 'power1.out' }, thumb ? 0.18 : 0.05)
  }, [item.id, onClose])

  // 打开时锁住页面滚动并接管焦点，关闭后还原
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    scroller.lock()
    closeButton.current?.focus()
    return () => {
      scroller.unlock()
      previous?.focus({ preventScroll: true })
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close()
      else if (many && e.key === 'ArrowRight') step(1)
      else if (many && e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [many, close, step])

  // 背景淡入（只在打开时一次）
  useGSAP(
    () => {
      if (prefersReducedMotion()) return
      gsap.from(root.current, { autoAlpha: 0, duration: 0.45, ease: 'power1.out' })
      gsap.from('[data-lb-ui]', { autoAlpha: 0, y: 14, duration: 0.6, delay: 0.25, stagger: 0.06 })
    },
    { scope: root },
  )

  // 图片：刚打开时从缩略图的位置放大出来；翻页时从翻页的方向滑进来
  useGSAP(
    () => {
      const img = image.current
      if (!img || prefersReducedMotion()) return
      if (direction.current !== 0) {
        gsap.from(img, { autoAlpha: 0, x: 60 * direction.current, duration: 0.55 })
        return
      }
      const thumb = thumbOf(item.id)
      if (thumb) {
        gsap.from(img, { ...fitTo(img, thumb), duration: 0.8, ease: 'silk', clearProps: 'transform' })
      } else {
        gsap.from(img, { autoAlpha: 0, scale: 0.92, duration: 0.6 })
      }
    },
    { dependencies: [item.id], scope: root, revertOnUpdate: true },
  )

  const pad = (n: number) => String(n).padStart(2, '0')

  return createPortal(
    <div
      ref={root}
      role="dialog"
      aria-modal="true"
      aria-label={item.caption}
      data-lenis-prevent
      className="fixed inset-0 z-100 flex flex-col bg-night-950/92 backdrop-blur-xl"
      onClick={close}
    >
      <div data-lb-ui className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <p className="font-mono text-xs tracking-[0.2em] text-mist-400">
          {pad(index + 1)} / {pad(items.length)}
        </p>
        <button
          ref={closeButton}
          type="button"
          aria-label="关闭"
          className="grid size-11 place-items-center rounded-full border border-white/12 bg-white/6 text-mist-100 transition-colors hover:bg-white/12"
          onClick={close}
        >
          <Close className="size-5" />
        </button>
      </div>

      <div
        className="relative flex min-h-0 flex-1 items-center justify-center px-4 md:px-24"
        onTouchStart={(e) => {
          touchX.current = e.touches[0].clientX
        }}
        onTouchEnd={(e) => {
          if (touchX.current === null || !many) return
          const dx = e.changedTouches[0].clientX - touchX.current
          touchX.current = null
          if (Math.abs(dx) > 48) step(dx < 0 ? 1 : -1)
        }}
      >
        <img
          ref={image}
          key={item.id}
          src={m.src}
          width={m.w}
          height={m.h}
          alt={item.caption}
          draggable={false}
          className="h-auto max-h-full w-auto max-w-full rounded-xl bg-cover object-contain shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)]"
          // 大图还没下载完的时候先用已经在页面上的小图垫着，放大的过程里不会是一块空白
          style={{ backgroundColor: m.color, backgroundImage: `url(${m.sm})` }}
          onClick={(e) => e.stopPropagation()}
        />
        {many && (
          <>
            <button
              type="button"
              data-lb-ui
              aria-label="上一张"
              className="absolute left-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-night-900/70 text-mist-100 transition-colors hover:bg-white/12 md:grid"
              onClick={(e) => {
                e.stopPropagation()
                step(-1)
              }}
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              data-lb-ui
              aria-label="下一张"
              className="absolute right-3 top-1/2 hidden size-12 -translate-y-1/2 place-items-center rounded-full border border-white/12 bg-night-900/70 text-mist-100 transition-colors hover:bg-white/12 md:grid"
              onClick={(e) => {
                e.stopPropagation()
                step(1)
              }}
            >
              <ChevronRight className="size-6" />
            </button>
          </>
        )}
      </div>

      <p data-lb-ui className="px-5 pb-6 pt-4 text-center text-sm text-mist-300">
        {item.caption}
        {many && <span className="ml-3 text-xs text-mist-500 md:hidden">左右滑动切换</span>}
      </p>
    </div>,
    document.body,
  )
}
