import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FINE_POINTER, gsap, matches } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/hooks'

/** 哪些元素会被取景框「对上焦」。data-cursor 可以带一个提示词，例如 data-cursor="拖动" */
const TARGETS = 'a[href], button:not(:disabled), [data-cursor]'

/** 角标的边长、线宽，框离元素边缘的距离，以及空闲时角标离中心的距离（像素） */
const CORNER = 10
const STROKE = 1.5
const GAP = 6
const IDLE = 11

/** 空闲时四个角标相对中心的位置：左上、右上、右下、左下 */
const REST = [
  { x: -IDLE, y: -IDLE },
  { x: IDLE - CORNER, y: -IDLE },
  { x: IDLE - CORNER, y: IDLE - CORNER },
  { x: -IDLE, y: IDLE - CORNER },
]

const CORNER_BORDERS = ['border-r-0 border-b-0', 'border-l-0 border-b-0', 'border-l-0 border-t-0', 'border-r-0 border-t-0']

/**
 * 取景框光标：鼠标变成相机取景器的四个角标，平时缓缓旋转，
 * 移到链接、按钮、图片上时四个角会张开「框住」那个元素，像对上了焦。
 *
 * 来自 React Bits（reactbits.dev）的 TargetCursor，保留了它「角标吸附到目标四角」的核心做法，改动：
 * - 原版只在鼠标移入时量一次目标的位置，页面带惯性滚动、卡片会倾斜时框会对不上，这里每一帧重新量；
 * - 原版每帧新建四个补间动画，这里改成手动插值；
 * - 加了提示词小标签（data-cursor="查看" 之类），鼠标移出窗口时自动隐藏；
 * - 用 (hover + fine pointer) 判断有没有鼠标，而不是猜浏览器型号。
 * 触屏设备和开了「减弱动态效果」的访客不启用，保留系统光标。
 */
export function TargetCursor() {
  const reticle = useRef<HTMLDivElement>(null)
  const spinner = useRef<HTMLDivElement>(null)
  const tag = useRef<HTMLDivElement>(null)
  const tagText = useRef<HTMLSpanElement>(null)
  const enabled = typeof window !== 'undefined' && matches(FINE_POINTER) && !prefersReducedMotion()

  useEffect(() => {
    const root = reticle.current
    const spin = spinner.current
    const labelAt = tag.current
    const label = tagText.current
    if (!enabled || !root || !spin || !labelAt || !label) return

    const corners = [...root.querySelectorAll<HTMLElement>('[data-corner]')]
    const points = REST.map((p) => ({ ...p }))
    const mouse = { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    const pos = { ...mouse }
    let target: Element | null = null
    let visible = false

    document.documentElement.classList.add('has-reticle')
    gsap.set([root, label], { autoAlpha: 0 })
    const idleSpin = gsap.to(spin, { rotation: '+=360', duration: 9, ease: 'none', repeat: -1 })

    const show = (on: boolean) => {
      if (visible === on) return
      visible = on
      gsap.to(root, { autoAlpha: on ? 1 : 0, duration: 0.25, ease: 'power1.out', overwrite: true })
      if (!on) gsap.to(label, { autoAlpha: 0, duration: 0.2, overwrite: true })
    }

    const lock = (next: Element | null) => {
      if (next === target) return
      target = next
      root.dataset.locked = String(Boolean(next))
      const text = next?.getAttribute('data-cursor') ?? ''
      if (text) label.textContent = text
      gsap.to(label, {
        autoAlpha: text ? 1 : 0,
        scale: text ? 1 : 0.6,
        duration: 0.3,
        ease: 'power3.out',
        overwrite: true,
      })
      if (next) {
        // 框住目标时停止旋转，转回最近的 90°（四个角是对称的，转过去不会绕远路）
        idleSpin.pause()
        const rotation = Number(gsap.getProperty(spin, 'rotation'))
        gsap.to(spin, { rotation: Math.round(rotation / 90) * 90, duration: 0.3, ease: 'power3.out', overwrite: true })
      } else {
        gsap.killTweensOf(spin)
        idleSpin.invalidate().restart()
      }
    }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
      if (!visible) {
        // 第一次出现时直接到位，不从屏幕中间飞过来
        pos.x = mouse.x
        pos.y = mouse.y
        show(true)
      }
    }
    const onOver = (e: MouseEvent) => lock((e.target as Element | null)?.closest?.(TARGETS) ?? null)
    const onLeaveWindow = () => show(false)
    const onDown = () => gsap.to(spin, { scale: 0.82, duration: 0.2, ease: 'power2.out' })
    const onUp = () => gsap.to(spin, { scale: 1, duration: 0.5, ease: 'elastic.out(1, 0.5)' })

    const tick = () => {
      if (!visible) return
      // 每秒 60 帧时每帧走完剩余距离的一部分；帧率不同时按比例折算，手感一致
      const ratio = gsap.ticker.deltaRatio(60)
      const follow = 1 - Math.pow(1 - 0.38, ratio)
      const snap = 1 - Math.pow(1 - 0.24, ratio)
      pos.x += (mouse.x - pos.x) * follow
      pos.y += (mouse.y - pos.y) * follow
      const transform = `translate3d(${pos.x.toFixed(2)}px, ${pos.y.toFixed(2)}px, 0)`
      root.style.transform = transform
      labelAt.style.transform = transform

      // 目标被移出文档（换页、筛选）时松开
      if (target && !target.isConnected) lock(null)
      const rect = target?.getBoundingClientRect()
      corners.forEach((corner, i) => {
        const point = points[i]
        let goalX = REST[i].x
        let goalY = REST[i].y
        if (rect) {
          const right = i === 1 || i === 2
          const bottom = i >= 2
          goalX = (right ? rect.right + GAP - CORNER : rect.left - GAP) - pos.x
          goalY = (bottom ? rect.bottom + GAP - CORNER : rect.top - GAP) - pos.y
        }
        point.x += (goalX - point.x) * snap
        point.y += (goalY - point.y) * snap
        corner.style.transform = `translate3d(${point.x.toFixed(2)}px, ${point.y.toFixed(2)}px, 0)`
      })
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    window.addEventListener('mousedown', onDown, { passive: true })
    window.addEventListener('mouseup', onUp, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeaveWindow)
    gsap.ticker.add(tick)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      window.removeEventListener('mousedown', onDown)
      window.removeEventListener('mouseup', onUp)
      document.documentElement.removeEventListener('mouseleave', onLeaveWindow)
      gsap.ticker.remove(tick)
      idleSpin.kill()
      gsap.killTweensOf([root, spin, label])
      document.documentElement.classList.remove('has-reticle')
    }
  }, [enabled])

  if (!enabled) return null

  return createPortal(
    <>
      <div
        ref={reticle}
        aria-hidden="true"
        className="group pointer-events-none invisible fixed left-0 top-0 z-130 size-0 drop-shadow-[0_0_1.5px_rgb(12_4_35/0.95)] will-change-transform"
      >
        <div ref={spinner} className="absolute left-0 top-0 size-0">
          <span className="absolute -left-[2px] -top-[2px] size-1 rounded-full bg-mist-50 transition-colors duration-300 group-data-[locked=true]:bg-blush-300" />
          {CORNER_BORDERS.map((borders, i) => (
            <span
              key={i}
              data-corner
              className={`absolute left-0 top-0 border-mist-50 transition-colors duration-300 group-data-[locked=true]:border-blush-300 ${borders}`}
              style={{
                width: CORNER,
                height: CORNER,
                borderWidth: STROKE,
                transform: `translate3d(${REST[i].x}px, ${REST[i].y}px, 0)`,
              }}
            />
          ))}
        </div>
      </div>
      {/* 外层只管跟着鼠标走（直接写 transform），里层交给 GSAP 做出现 / 消失的缩放，两件事互不干扰 */}
      <div ref={tag} aria-hidden="true" className="pointer-events-none fixed left-4 top-4 z-130 will-change-transform">
        <span
          ref={tagText}
          className="invisible block origin-top-left whitespace-nowrap rounded-full bg-linear-to-r from-blush-200 to-iris-300 px-2.5 py-1 text-[11px] font-medium leading-4 text-night-800 shadow-[0_8px_24px_-8px_rgb(7_2_22/0.9)]"
        />
      </div>
    </>,
    document.body,
  )
}
