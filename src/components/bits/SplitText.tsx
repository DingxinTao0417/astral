import { useRef, type CSSProperties, type ReactNode } from 'react'
import { gsap, SplitText as GSAPSplitText, useGSAP } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/hooks'
import { stage } from '../../lib/stage'

type Tag = 'h1' | 'h2' | 'h3' | 'p' | 'span'

interface SplitTextProps {
  /** 要拆的文字。也可以放 <Phrases> 这类只含文字的元素 */
  children: ReactNode
  className?: string
  style?: CSSProperties
  id?: string
  tag?: Tag
  /** 逐字还是逐行 */
  splitType?: 'chars' | 'lines'
  /** 相邻两个字（行）之间的间隔，毫秒 */
  delay?: number
  duration?: number
  ease?: string
  /** 开演前等多久，秒 */
  wait?: number
  /** 滚动到什么位置开始，ScrollTrigger 的 start 写法 */
  start?: string
}

/**
 * 标题进场：把文字拆成一个个字（或一行行），从每一行的下沿依次「长」出来。
 *
 * 来自 React Bits（reactbits.dev）的 SplitText（底层是 GSAP 的 SplitText 插件），按这个站的需要改了：
 * - 每一行套了遮罩：字是从行的下沿升上来的，而不是简单的淡入；
 * - 中文没有空格，不能按「词」拆，这里只按行 + 字拆，断行位置交给 <Phrases> 控制；
 * - 标题字体加载完、窗口宽度变了会自动重新拆，动画接着原来的进度放；
 * - 页面被开场或转场幕布盖着时先不动，幕布拉开再开始。
 */
export function SplitText({
  children,
  className,
  style,
  id,
  tag: Tag = 'p',
  splitType = 'chars',
  delay = 38,
  duration = 1.15,
  ease = 'silk',
  wait = 0,
  start = 'top 90%',
}: SplitTextProps) {
  const ref = useRef<HTMLElement>(null)

  useGSAP((_, contextSafe) => {
    const el = ref.current
    if (!el || prefersReducedMotion()) return
    // 先藏起来，等拆好字再显示，避免先闪一下完整的标题
    gsap.set(el, { autoAlpha: 0 })

    return stage.whenOpen(
      contextSafe!(() => {
        GSAPSplitText.create(el, {
          type: splitType === 'lines' ? 'lines' : 'lines,chars',
          mask: 'lines',
          linesClass: 'split-line',
          charsClass: 'split-char',
          smartWrap: false,
          autoSplit: true,
          onSplit: (self) => {
            gsap.set(el, { autoAlpha: 1 })
            return gsap.from(splitType === 'lines' ? self.lines : self.chars, {
              yPercent: 118,
              rotate: splitType === 'lines' ? 0 : 5,
              duration,
              ease,
              stagger: delay / 1000,
              delay: wait,
              scrollTrigger: { trigger: el, start, once: true },
            })
          },
        })
      }),
    )
  }, [])

  return (
    <Tag ref={ref as never} id={id} style={style} className={className}>
      {children}
    </Tag>
  )
}
