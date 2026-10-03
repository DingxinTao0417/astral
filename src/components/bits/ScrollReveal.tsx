import { useMemo, useRef } from 'react'
import { FINE_POINTER, gsap, matches, useGSAP } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/hooks'

interface ScrollRevealProps {
  /** 一段纯文字 */
  children: string
  className?: string
  /** 还没读到的词有多淡（0–1） */
  baseOpacity?: number
  enableBlur?: boolean
  /** 还没读到的词有多糊（像素） */
  blurStrength?: number
}

const PUNCTUATION = /^[，。、；：？！」』》）,.;:?!…—·]+$/
const SPACE = /^\s+$/

/**
 * 把一段话切成一个个「词」。中文没有空格，用浏览器自带的分词（Intl.Segmenter）来切；
 * 老浏览器没有这个功能就退回逐字。标点并到前一个词上，这样不会出现标点单独落在行首。
 */
function segment(text: string): string[] {
  const pieces =
    'Segmenter' in Intl
      ? [...new Intl.Segmenter('zh', { granularity: 'word' }).segment(text)].map((s) => s.segment)
      : [...text]
  const words: string[] = []
  for (const piece of pieces) {
    const last = words[words.length - 1]
    // 空格单独留着，渲染成普通文字：包进词里的话会被浏览器当成行尾空格吃掉
    if (SPACE.test(piece)) words.push(' ')
    else if (last !== undefined && last !== ' ' && PUNCTUATION.test(piece)) words[words.length - 1] += piece
    else words.push(piece)
  }
  // 开头的引号、括号并到后一个词上，同样是为了不让它单独留在行尾
  for (let i = words.length - 2; i >= 0; i--) {
    if (/^[「『《（]+$/.test(words[i])) {
      words[i + 1] = words[i] + words[i + 1]
      words.splice(i, 1)
    }
  }
  return words
}

/**
 * 跟着滚动「读」出来的段落：一开始整段是淡的、糊的，往下滚，词一个接一个变清楚。
 *
 * 来自 React Bits（reactbits.dev）的 ScrollReveal，改动：
 * - 原版按空格切词，中文切不开，这里换成按中文分词；
 * - 去掉了整段文字的倾斜回正（中文段落歪着不好看）；
 * - 原版卸载时会把页面上所有的滚动动画都清掉，这里只清自己的；
 * - 「从模糊到清楚」只在电脑上开，手机上只做淡入：几十个词同时算模糊，中低端手机会掉帧。
 */
export function ScrollReveal({
  children,
  className,
  baseOpacity = 0.16,
  enableBlur = true,
  blurStrength = 4,
}: ScrollRevealProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const words = useMemo(() => segment(children), [children])

  useGSAP(
    () => {
      const el = ref.current
      if (!el || prefersReducedMotion()) return
      const blur = enableBlur && matches(FINE_POINTER)
      gsap.fromTo(
        el.querySelectorAll('.word'),
        { opacity: baseOpacity, ...(blur && { filter: `blur(${blurStrength}px)` }) },
        {
          opacity: 1,
          ...(blur && { filter: 'blur(0px)' }),
          ease: 'none',
          stagger: 0.05,
          scrollTrigger: { trigger: el, start: 'top 88%', end: 'bottom 58%', scrub: true },
        },
      )
    },
    { scope: ref },
  )

  return (
    <p ref={ref} className={className}>
      {/* 读屏软件读整段，不读被拆开的词 */}
      <span className="sr-only">{children}</span>
      <span aria-hidden="true">
        {words.map((word, i) =>
          word === ' ' ? (
            ' '
          ) : (
            <span key={i} className="word inline-block">
              {word}
            </span>
          ),
        )}
      </span>
    </p>
  )
}
