import { useEffect, useRef, type RefObject } from 'react'
import { cx } from '../../lib/cx'
import { prefersReducedMotion } from '../../lib/hooks'
import type { Nova } from '../../lib/vanta-nova'

export interface RingGeometry {
  /** 光环中心，相对容器左上角，像素 */
  x: number
  y: number
  /** 半径，像素 */
  r: number
  /** 光环上最亮那一点的方向：从正上方起顺时针，弧度 */
  angle: number
}

interface VantaNovaProps {
  className?: string
  /** 光环画在哪、多大。容器或 watch 的尺寸变了会重新调用 */
  measure: () => RingGeometry | null
  /** 这个元素的尺寸变化时也重新量一次（比如标题字体加载完） */
  watch?: RefObject<Element | null>
}

/**
 * 画质档位：画面分辨率 = 屏幕像素比 ÷ 这个倍数。光环本来就是柔光，先用 2/3 的分辨率画再放大；
 * 如果这台电脑还是带不动，降到 4 成；再带不动就把光环关掉，只留下面的极光。
 */
const QUALITY = [1.5, 2.5]
/** 光环开始跑多久之后才检查流畅度（毫秒）：避开进场动画和资源加载那几秒 */
const SETTLE = 4500
/** 一帧超过多少毫秒才有可能算「不流畅」（约等于低于 30 帧 / 秒） */
const SLOW_FRAME = 34
/** 并且要比没开光环时慢这么多倍，才算是光环拖慢的 */
const SLOWDOWN = 1.6

/**
 * 量一段时间里每帧的间隔，返回中位数（毫秒）。凑够 count 帧或者到了 timeout 就结束。
 * 间隔超过 1 秒的不算：那是标签页被切到后台了，不说明性能。一帧都没量到返回 Infinity。
 */
function sampleFrames(count: number, timeout: number, onFrame?: (id: number) => void) {
  return new Promise<number>((resolve) => {
    const deltas: number[] = []
    const startedAt = performance.now()
    let last = 0
    const tick = (now: number) => {
      const delta = now - last
      if (last && delta > 0 && delta < 1000) deltas.push(delta)
      last = now
      if (deltas.length >= count || now - startedAt > timeout) {
        resolve(deltas.length ? deltas.sort((a, b) => a - b)[deltas.length >> 1] : Infinity)
        return
      }
      onFrame?.(requestAnimationFrame(tick))
    }
    onFrame?.(requestAnimationFrame(tick))
  })
}

/**
 * 首屏的「新星」光环（基于 Vanta.js，见 lib/vanta-nova.ts）：一圈会呼吸、拖着日冕、被鼠标牵引的辉光。
 * 画布用「滤色」叠在下面的极光上，只加光不遮挡。
 * three.js 和 Vanta 体积不小，等页面先画出来之后再异步加载；开了「减弱动态效果」时不加载。
 *
 * 跑起来之后会自己量帧率：和没开光环时比，明显变慢了就先降画质，还是慢就把光环关掉。
 * 之所以要和「没开时」比，是因为帧率低不一定是显卡带不动——浏览器开了省电模式、
 * 窗口被别的窗口挡住时本来就会降帧，那种情况不该把光环关了。
 */
export function VantaNova({ className, measure, watch }: VantaNovaProps) {
  const host = useRef<HTMLDivElement>(null)
  const measureRef = useRef(measure)

  useEffect(() => {
    measureRef.current = measure
  }, [measure])

  useEffect(() => {
    const el = host.current
    if (!el || prefersReducedMotion()) return

    let cancelled = false
    let nova: Nova | null = null
    let frame = 0
    let settle = 0
    const keepFrame = (id: number) => {
      frame = id
    }

    const fit = () => {
      const { offsetWidth: w, offsetHeight: h } = el
      const ring = measureRef.current()
      if (!nova || !ring || !w || !h) return
      nova.setOptions({
        xOffset: (ring.x - w / 2) / w,
        yOffset: (h / 2 - ring.y) / h,
        // 着色器里：光环半径 ≈ size × 0.1856 × 画面高度
        size: Math.min(ring.r / h, 0.7) / 0.1856,
        hotAngle: ring.angle,
      })
    }
    const resizer = new ResizeObserver(fit)

    /** 光环在屏幕上的时候量帧率；比基准慢太多就降一档，降到头就关掉 */
    const guard = async (baseline: number, level: number) => {
      const median = await sampleFrames(80, 6000, keepFrame)
      if (cancelled || !nova) return
      const onScreen = !document.hidden && window.scrollY < el.offsetHeight * 0.5
      // 访客已经滚走了：这次量的不算，等会儿再量
      if (!onScreen) {
        settle = window.setTimeout(() => void guard(baseline, level), SETTLE)
        return
      }
      if (median < Math.max(SLOW_FRAME, baseline * SLOWDOWN)) return
      if (level + 1 < QUALITY.length) {
        nova.options.scale = nova.options.scaleMobile = window.devicePixelRatio * QUALITY[level + 1]
        nova.resize()
        void guard(baseline, level + 1)
      } else {
        el.dataset.ready = 'false'
        nova.dispose()
        nova = null
      }
    }

    void Promise.all([
      import('../../lib/vanta-nova'),
      // 光环出现之前先量一下基准帧率
      sampleFrames(30, 1500, keepFrame),
    ]).then(([{ Nova }, baseline]) => {
      if (cancelled) return
      nova = new Nova({
        el,
        mouseControls: true,
        touchControls: false,
        gyroControls: false,
        scale: window.devicePixelRatio * QUALITY[0],
        scaleMobile: window.devicePixelRatio * QUALITY[0],
      })
      if (import.meta.env.DEV) (window as unknown as { __nova: Nova }).__nova = nova
      fit()
      resizer.observe(el)
      if (watch?.current) resizer.observe(watch.current)
      // 等它画出第一帧再淡入
      requestAnimationFrame(() => {
        el.dataset.ready = 'true'
      })
      settle = window.setTimeout(() => void guard(baseline, 0), SETTLE)
    })

    return () => {
      cancelled = true
      window.clearTimeout(settle)
      cancelAnimationFrame(frame)
      resizer.disconnect()
      nova?.dispose()
    }
  }, [watch])

  return (
    <div
      ref={host}
      aria-hidden="true"
      className={cx(
        '[&>canvas]:opacity-0 [&>canvas]:mix-blend-screen [&>canvas]:transition-opacity [&>canvas]:duration-[1800ms] data-[ready=true]:[&>canvas]:opacity-100',
        className,
      )}
    />
  )
}
