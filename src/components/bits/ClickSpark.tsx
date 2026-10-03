import { useEffect, useRef } from 'react'
import { prefersReducedMotion } from '../../lib/hooks'

interface ClickSparkProps {
  sparkColor?: string
  sparkSize?: number
  sparkRadius?: number
  sparkCount?: number
  /** 毫秒 */
  duration?: number
}

interface Spark {
  x: number
  y: number
  angle: number
  startTime: number
}

/**
 * 点击火花：在点下去的位置迸出一圈短线。
 *
 * 来自 React Bits（reactbits.dev）的 ClickSpark，画法没变，改了三处：
 * 原版是包住子元素、画布跟着整页一样高并且每一帧都在重画；这里改成一张盖住屏幕的固定画布、
 * 监听整个窗口的点击，只有屏幕上有火花时才画，其余时间不占任何性能；另外按屏幕像素比画，线条不发虚。
 */
export function ClickSpark({
  sparkColor = '#ffcbe7',
  sparkSize = 11,
  sparkRadius = 22,
  sparkCount = 8,
  duration = 480,
}: ClickSparkProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || prefersReducedMotion()) return

    let sparks: Spark[] = []
    let frame = 0
    let dpr = 1

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = Math.round(window.innerWidth * dpr)
      canvas.height = Math.round(window.innerHeight * dpr)
    }

    const draw = (now: number) => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight)
      ctx.strokeStyle = sparkColor
      ctx.lineWidth = 1.75
      ctx.lineCap = 'round'

      sparks = sparks.filter((spark) => {
        const progress = (now - spark.startTime) / duration
        if (progress >= 1) return false
        const eased = progress * (2 - progress)
        const distance = eased * sparkRadius
        const length = sparkSize * (1 - eased)
        const cos = Math.cos(spark.angle)
        const sin = Math.sin(spark.angle)
        ctx.beginPath()
        ctx.moveTo(spark.x + distance * cos, spark.y + distance * sin)
        ctx.lineTo(spark.x + (distance + length) * cos, spark.y + (distance + length) * sin)
        ctx.stroke()
        return true
      })

      frame = sparks.length > 0 ? requestAnimationFrame(draw) : 0
    }

    const onClick = (e: MouseEvent) => {
      // 用键盘回车触发的「点击」没有鼠标位置，不放火花
      if (e.detail === 0) return
      const now = performance.now()
      // 每次起始角度错开一点，连点时不会完全重合
      const offset = Math.random() * Math.PI
      for (let i = 0; i < sparkCount; i++) {
        sparks.push({ x: e.clientX, y: e.clientY, angle: offset + (2 * Math.PI * i) / sparkCount, startTime: now })
      }
      if (!frame) frame = requestAnimationFrame(draw)
    }

    resize()
    window.addEventListener('resize', resize)
    // 用 click 而不是 pointerdown：手机上手指按下去滑动页面不算点击，不会一路冒火花
    window.addEventListener('click', onClick, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('resize', resize)
      window.removeEventListener('click', onClick)
    }
  }, [sparkColor, sparkSize, sparkRadius, sparkCount, duration])

  return <canvas ref={canvasRef} aria-hidden="true" className="pointer-events-none fixed inset-0 z-120 size-full" />
}
