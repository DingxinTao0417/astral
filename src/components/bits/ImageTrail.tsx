import { useEffect, useRef } from 'react'
import { getMedia } from '../../content/media'
import { cx } from '../../lib/cx'
import { gsap } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/hooks'

interface ImageTrailProps {
  /** media.json 里的素材 id，按顺序轮流出现 */
  ids: string[]
  /** 鼠标每移动多少像素放出下一张 */
  threshold?: number
  className?: string
}

/**
 * 图片拖尾：鼠标在这块区域里移动时，照片一张接一张地在鼠标身后出现、追上来、再缩小消失。
 *
 * 来自 React Bits（reactbits.dev）的 ImageTrail（第 1 种变体），出图的节奏和动画参数基本没动，改动：
 * - 这一层自己不接收鼠标事件，改成监听父元素，这样不会挡住上面的文字和链接；
 * - 用全站的 GSAP 时钟代替它自己的 requestAnimationFrame 循环，滚出屏幕后自动停；
 * - 每张照片出现时带一点随机的倾斜，更像随手撒出来的。
 * 只应该在有鼠标的设备上挂载（调用方用 useMedia 判断），免得手机白白下载这些图。
 */
export function ImageTrail({ ids, threshold = 96, className }: ImageTrailProps) {
  const root = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const layer = root.current
    const zone = layer?.parentElement
    if (!layer || !zone || prefersReducedMotion()) return

    const images = [...layer.children] as HTMLElement[]
    const mouse = { x: 0, y: 0 }
    const last = { x: 0, y: 0 }
    const cache = { x: 0, y: 0 }
    let index = -1
    let zIndex = 1
    let started = false
    let onScreen = true

    const onMove = (e: MouseEvent) => {
      const rect = zone.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      if (!started) {
        started = true
        Object.assign(cache, mouse)
        Object.assign(last, mouse)
      }
    }

    const showNext = () => {
      index = (index + 1) % images.length
      zIndex = zIndex > 500 ? 1 : zIndex + 1
      const img = images[index]
      const w = img.offsetWidth
      const h = img.offsetHeight
      gsap.killTweensOf(img)
      gsap
        .timeline()
        .fromTo(
          img,
          {
            autoAlpha: 1,
            scale: 1,
            zIndex,
            x: cache.x - w / 2,
            y: cache.y - h / 2,
            rotate: gsap.utils.random(-9, 9),
          },
          { duration: 0.4, ease: 'power1', x: mouse.x - w / 2, y: mouse.y - h / 2 },
          0,
        )
        .to(img, { duration: 0.45, ease: 'power3', autoAlpha: 0, scale: 0.2 }, 0.42)
    }

    const tick = () => {
      if (!started || !onScreen) return
      cache.x += (mouse.x - cache.x) * 0.1
      cache.y += (mouse.y - cache.y) * 0.1
      if (Math.hypot(mouse.x - last.x, mouse.y - last.y) > threshold) {
        showNext()
        Object.assign(last, mouse)
      }
    }

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
    })
    visibility.observe(zone)
    zone.addEventListener('mousemove', onMove, { passive: true })
    gsap.ticker.add(tick)

    return () => {
      visibility.disconnect()
      zone.removeEventListener('mousemove', onMove)
      gsap.ticker.remove(tick)
      gsap.killTweensOf(images)
    }
  }, [threshold])

  return (
    <div ref={root} aria-hidden="true" className={cx('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      {ids.map((id) => {
        const m = getMedia(id)
        return (
          <div
            key={id}
            className="invisible absolute left-0 top-0 w-[clamp(9rem,15vw,13rem)] overflow-hidden rounded-2xl opacity-0 shadow-[0_30px_70px_-25px_rgb(7_2_22/0.95)] ring-1 ring-white/25 will-change-transform"
            style={{ aspectRatio: `${m.w} / ${m.h}`, backgroundColor: m.color }}
          >
            <img src={m.sm} alt="" decoding="async" draggable={false} className="size-full object-cover" />
          </div>
        )
      })}
    </div>
  )
}
