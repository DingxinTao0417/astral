import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { FINE_POINTER, gsap, matches } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/hooks'

/**
 * 光标旁的小标签：鼠标移到带 data-cursor="查看" 这类标记的元素上时，指针旁边跟出一个小标签，
 * 提示这里可以点开 / 拖动 / 播放。系统光标本身不动。
 * 触屏设备和开了「减弱动态效果」的访客不启用。
 */
export function CursorTag() {
  const anchor = useRef<HTMLDivElement>(null)
  const pill = useRef<HTMLSpanElement>(null)
  const enabled = typeof window !== 'undefined' && matches(FINE_POINTER) && !prefersReducedMotion()

  useEffect(() => {
    const at = anchor.current
    const label = pill.current
    if (!enabled || !at || !label) return

    const mouse = { x: 0, y: 0 }
    const pos = { x: 0, y: 0 }
    let target: Element | null = null
    let following = false

    // 标签跟着鼠标走，稍微慢半拍。只在标签露面的时候才跑，平时不占性能
    const tick = () => {
      if (target && !target.isConnected) show(null)
      const ease = 1 - Math.pow(1 - 0.32, gsap.ticker.deltaRatio(60))
      pos.x += (mouse.x - pos.x) * ease
      pos.y += (mouse.y - pos.y) * ease
      at.style.transform = `translate3d(${pos.x.toFixed(1)}px, ${pos.y.toFixed(1)}px, 0)`
    }
    const follow = (on: boolean) => {
      if (on === following) return
      following = on
      if (on) gsap.ticker.add(tick)
      else gsap.ticker.remove(tick)
    }

    const show = (next: Element | null) => {
      if (next === target) return
      const wasHidden = !target
      target = next
      if (next) {
        label.textContent = next.getAttribute('data-cursor')
        // 从没有到有：直接出现在鼠标旁边，不从上一次消失的地方飞过来
        if (wasHidden) Object.assign(pos, mouse)
        follow(true)
        gsap.to(label, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'power3.out', overwrite: true })
      } else {
        gsap.to(label, {
          autoAlpha: 0,
          scale: 0.6,
          duration: 0.2,
          ease: 'power2.out',
          overwrite: true,
          onComplete: () => follow(false),
        })
      }
    }

    const onMove = (e: MouseEvent) => {
      mouse.x = e.clientX
      mouse.y = e.clientY
    }
    const onOver = (e: MouseEvent) =>
      show((e.target as Element | null)?.closest?.('[data-cursor]:not([data-cursor=""])') ?? null)
    const onLeaveWindow = () => show(null)

    gsap.set(label, { autoAlpha: 0, scale: 0.6 })
    window.addEventListener('mousemove', onMove, { passive: true })
    window.addEventListener('mouseover', onOver, { passive: true })
    document.documentElement.addEventListener('mouseleave', onLeaveWindow)

    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
      document.documentElement.removeEventListener('mouseleave', onLeaveWindow)
      follow(false)
      gsap.killTweensOf(label)
    }
  }, [enabled])

  if (!enabled) return null

  return createPortal(
    // 外层只管跟着鼠标走（直接写 transform），里层交给 GSAP 做出现 / 消失的缩放，两件事互不干扰
    <div ref={anchor} aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-130 will-change-transform">
      <span
        ref={pill}
        className="invisible ml-4 mt-5 block origin-top-left whitespace-nowrap rounded-full bg-linear-to-r from-blush-200 to-iris-300 px-2.5 py-1 text-[11px] font-medium leading-4 text-night-800 shadow-[0_8px_24px_-8px_rgb(7_2_22/0.9)]"
      />
    </div>,
    document.body,
  )
}
