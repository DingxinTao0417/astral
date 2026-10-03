import Lenis from 'lenis'
import 'lenis/dist/lenis.css'
import { useEffect } from 'react'
import { gsap, ScrollTrigger } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/hooks'
import { scroller } from '../../lib/scroll'

/**
 * 全站平滑滚动。Lenis 把滚轮变成带惯性的滚动，并且和 GSAP 共用同一个时钟，
 * 滚动驱动的动画才不会和页面位置差一帧。触屏上保持系统原生的滚动手感。
 * 开了「减弱动态效果」的访客不启用。
 */
export function SmoothScroll() {
  useEffect(() => {
    if (prefersReducedMotion()) return

    const lenis = new Lenis({ lerp: 0.1, anchors: true, autoRaf: false })
    lenis.on('scroll', ScrollTrigger.update)
    const tick = (time: number) => lenis.raf(time * 1000)
    gsap.ticker.add(tick)
    gsap.ticker.lagSmoothing(0)
    scroller.attach(lenis)

    return () => {
      scroller.attach(null)
      gsap.ticker.remove(tick)
      lenis.destroy()
    }
  }, [])

  return null
}
