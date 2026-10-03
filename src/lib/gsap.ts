import { useGSAP } from '@gsap/react'
import gsap from 'gsap'
import { CustomEase } from 'gsap/CustomEase'
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { SplitText } from 'gsap/SplitText'

/**
 * 全站动效的统一入口：所有文件都从这里拿 gsap，保证插件只注册一次、缓动曲线全站一致。
 */
gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText, CustomEase, ScrambleTextPlugin)

// 三条全站通用的缓动曲线
CustomEase.create('silk', '0.16, 1, 0.3, 1') // 进场：起步快、收尾很长
CustomEase.create('soft', '0.2, 0.7, 0.2, 1') // 和 CSS 里的 --ease-soft 是同一条
CustomEase.create('curtain', '0.76, 0, 0.24, 1') // 幕布、转场：两头慢中间快

gsap.defaults({ ease: 'silk', duration: 1 })
// 手机浏览器地址栏收起会改变窗口高度，不为这个重算所有滚动动画
ScrollTrigger.config({ ignoreMobileResize: true })

/**
 * 用鼠标的大屏设备，并且没开「减弱动态效果」：钉住滚动、横向画廊、鼠标视差这些只在这里开。
 * 和 index.css 里的 desk: 变体是同一个条件，两边要一起改
 */
export const DESKTOP =
  '(min-width: 64rem) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)'
/** 有鼠标（不管屏幕多大） */
export const FINE_POINTER = '(hover: hover) and (pointer: fine)'

export const matches = (query: string) => window.matchMedia(query).matches

// 本地预览时把 gsap 挂到 window 上，方便在浏览器控制台里调试动画
if (import.meta.env.DEV) Object.assign(window, { gsap, ScrollTrigger })

export { gsap, ScrollTrigger, SplitText, useGSAP }
