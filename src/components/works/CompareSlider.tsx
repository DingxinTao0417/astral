import { useRef, useState, type CSSProperties, type PointerEvent } from 'react'
import { cx } from '../../lib/cx'
import { useInView } from '../../lib/hooks'
import { Drag } from '../Icons'
import { Img } from '../Img'

interface CompareSliderProps {
  name: string
  before: string
  after: string
  beforeLabel: string
  afterLabel: string
}

/** 前后对比滑块：左边白底图，右边成品。可拖、可点、可用键盘方向键 */
export function CompareSlider({ name, before, after, beforeLabel, afterLabel }: CompareSliderProps) {
  const [pos, setPos] = useState(50)
  const [touched, setTouched] = useState(false)
  const [ref, inView] = useInView<HTMLDivElement>()
  const dragging = useRef(false)

  const moveTo = (e: PointerEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPos(Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100)))
  }

  return (
    <div
      ref={ref}
      className={cx(
        'relative aspect-32/15 w-full cursor-ew-resize touch-pan-y select-none overflow-hidden rounded-2xl border border-white/10 bg-night-950',
        // 第一次进入视口时自己晃一下，提示可以拖
        inView && !touched && 'animate-[peek_2.6s_ease-in-out_0.6s_1]',
      )}
      style={{ '--pos': `${pos}%` } as CSSProperties}
      onPointerDown={(e) => {
        setTouched(true)
        dragging.current = true
        e.currentTarget.setPointerCapture(e.pointerId)
        // 触屏上按下不立刻跳，避免上下滑动页面时误触
        if (e.pointerType === 'mouse') moveTo(e)
      }}
      onPointerMove={(e) => {
        if (dragging.current) moveTo(e)
      }}
      onPointerUp={() => {
        dragging.current = false
      }}
      onPointerCancel={() => {
        dragging.current = false
      }}
    >
      <Img
        id={after}
        alt={`${name}：${afterLabel}`}
        sizes="(min-width: 1152px) 1056px, 92vw"
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0 bg-white" style={{ clipPath: 'inset(0 calc(100% - var(--pos)) 0 0)' }}>
        <Img
          id={before}
          alt={`${name}：${beforeLabel}`}
          sizes="(min-width: 1152px) 1056px, 92vw"
          className="size-full object-contain p-[2%]"
          style={{ backgroundColor: '#fff' }}
        />
      </div>

      <span className="absolute left-3 top-3 rounded-full bg-night-900/80 px-3 py-1 text-xs text-mist-100 backdrop-blur-sm md:left-4 md:top-4">
        {beforeLabel}
      </span>
      <span className="absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-xs font-medium text-night-900 backdrop-blur-sm md:right-4 md:top-4">
        {afterLabel}
      </span>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_22px_3px_rgb(255_138_203/0.85)]"
        style={{ left: 'var(--pos)' }}
      >
        <span className="absolute left-1/2 top-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white text-night-900 shadow-[0_8px_30px_rgb(0_0_0/0.45)]">
          <Drag className="size-5" />
        </span>
      </div>

      <input
        type="range"
        className="sr-only"
        aria-label={`${name}：拖动对比${beforeLabel}和${afterLabel}`}
        min={0}
        max={100}
        value={Math.round(pos)}
        onChange={(e) => {
          setTouched(true)
          setPos(Number(e.target.value))
        }}
      />
    </div>
  )
}
