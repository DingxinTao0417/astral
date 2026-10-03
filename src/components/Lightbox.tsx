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
import { ChevronLeft, ChevronRight, Close } from './Icons'

export interface LightboxItem {
  id: string
  caption: string
}

type OpenLightbox = (items: LightboxItem[], index: number) => void

const LightboxContext = createContext<OpenLightbox>(() => {})

/** 返回 open(items, index)，点开大图用 */
export const useLightbox = () => useContext(LightboxContext)

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
  const closeButton = useRef<HTMLButtonElement>(null)
  const touchX = useRef<number | null>(null)

  const step = useCallback(
    (delta: number) => onIndex((index + delta + items.length) % items.length),
    [index, items.length, onIndex],
  )

  // 打开时锁住页面滚动并接管焦点，关闭后还原
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null
    const root = document.documentElement
    const overflow = root.style.overflow
    root.style.overflow = 'hidden'
    closeButton.current?.focus()
    return () => {
      root.style.overflow = overflow
      previous?.focus()
    }
  }, [])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (many && e.key === 'ArrowRight') step(1)
      else if (many && e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [many, onClose, step])

  const pad = (n: number) => String(n).padStart(2, '0')

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-label={item.caption}
      className="fixed inset-0 z-100 flex animate-[fade-in_0.3s_ease-out] flex-col bg-night-950/92 backdrop-blur-xl"
      onClick={onClose}
    >
      <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4">
        <p className="font-mono text-xs tracking-[0.2em] text-mist-400">
          {pad(index + 1)} / {pad(items.length)}
        </p>
        <button
          ref={closeButton}
          type="button"
          aria-label="关闭"
          className="grid size-11 place-items-center rounded-full border border-white/12 bg-white/6 text-mist-100 transition-colors hover:bg-white/12"
          onClick={onClose}
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
          key={item.id}
          src={m.src}
          width={m.w}
          height={m.h}
          alt={item.caption}
          draggable={false}
          className="h-auto max-h-full w-auto max-w-full animate-[fade-in_0.4s_ease-out] rounded-xl object-contain shadow-[0_40px_120px_-30px_rgb(0_0_0/0.9)]"
          style={{ backgroundColor: m.color }}
          onClick={(e) => e.stopPropagation()}
        />
        {many && (
          <>
            <button
              type="button"
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

      <p className="px-5 pb-6 pt-4 text-center text-sm text-mist-300">
        {item.caption}
        {many && <span className="ml-3 text-xs text-mist-500 md:hidden">左右滑动切换</span>}
      </p>
    </div>,
    document.body,
  )
}
