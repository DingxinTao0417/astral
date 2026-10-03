import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { Link, useLocation, useNavigate, type LinkProps } from 'react-router'
import { brand, nav } from '../../content/site'
import { gsap } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/hooks'
import { scroller } from '../../lib/scroll'
import { stage } from '../../lib/stage'
import { Sparkle } from '../Icons'

type Go = (to: string) => void

const TransitionContext = createContext<Go>(() => {})

/** 带转场的跳转：go('/works') */
export const useTransitionNav = () => useContext(TransitionContext)

const PANELS = 5

/** 幕布上显示的目的地名字 */
function labelOf(to: string) {
  if (to === '/') return brand.name
  return nav.find((item) => item.to === to)?.label ?? ''
}

/**
 * 页面转场：点站内链接时，五块幕布从下往上依次盖住屏幕，中间亮出要去的页面名字，
 * 换好页面之后幕布继续上拉、露出新页面，新页面的进场动画在这时才开演。
 * 浏览器的前进 / 后退不走幕布，直接换页。
 */
export function TransitionProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const curtain = useRef<HTMLDivElement>(null)
  const phase = useRef<'idle' | 'closing' | 'closed' | 'opening'>('idle')
  const current = useRef(pathname)
  const [label, setLabel] = useState('')

  useEffect(() => {
    current.current = pathname
  }, [pathname])

  /** 拉开幕布，露出已经在后面挂好的新页面，新页面的进场动画这时才开演 */
  const open = useCallback(() => {
    const el = curtain.current
    if (phase.current !== 'closed' || !el) return
    phase.current = 'opening'
    const q = gsap.utils.selector(el)
    gsap
      .timeline({
        onComplete: () => {
          phase.current = 'idle'
          gsap.set(el, { visibility: 'hidden', pointerEvents: 'none' })
        },
      })
      .to(q('[data-label]'), { yPercent: -125, duration: 0.45, ease: 'power3.in' }, 0.12)
      .to(q('[data-panel]'), { yPercent: -101, duration: 0.8, ease: 'curtain', stagger: 0.055 }, 0.32)
      .add(() => stage.open(), 0.55)
  }, [])

  const go = useCallback<Go>(
    (to) => {
      if (phase.current !== 'idle') return
      if (to === current.current) {
        scroller.to(0)
        return
      }
      const el = curtain.current
      if (!el || prefersReducedMotion()) {
        navigate(to)
        return
      }

      phase.current = 'closing'
      stage.close()
      setLabel(labelOf(to))
      const q = gsap.utils.selector(el)
      gsap
        .timeline({
          onComplete: () => {
            phase.current = 'closed'
            navigate(to)
            // 正常情况下换页会触发下面的 useEffect 来拉开幕布；万一没触发，1.5 秒后也照样拉开，不能一直盖着
            gsap.delayedCall(1.5, open)
          },
        })
        .set(el, { visibility: 'visible', pointerEvents: 'auto' })
        .fromTo(q('[data-panel]'), { yPercent: 101 }, { yPercent: 0, duration: 0.7, ease: 'curtain', stagger: 0.055 })
        .fromTo(q('[data-label]'), { yPercent: 125 }, { yPercent: 0, duration: 0.65, ease: 'silk' }, 0.3)
    },
    [navigate, open],
  )

  // 新页面已经在幕布后面挂好了：拉开幕布
  useEffect(open, [pathname, open])

  return (
    <TransitionContext value={go}>
      {children}
      <div ref={curtain} aria-hidden="true" className="pointer-events-none invisible fixed inset-0 z-90 flex">
        {Array.from({ length: PANELS }, (_, i) => (
          <span
            key={i}
            data-panel
            className="-mr-px h-full flex-1 bg-linear-to-b from-night-800 via-night-900 to-night-950 shadow-[inset_0_1px_0_rgb(255_163_213/0.6),inset_0_-1px_0_rgb(173_140_255/0.6)]"
          />
        ))}
        <div className="absolute inset-0 grid place-items-center">
          <p className="overflow-hidden px-[0.2em] py-[0.12em]">
            <span
              data-label
              className={
                label === brand.name
                  ? 'flex items-center gap-[0.3em] font-display text-[clamp(3.5rem,11vw,7.5rem)] italic leading-none text-mist-50'
                  : 'flex items-center gap-[0.3em] font-serif text-[clamp(2.75rem,8.5vw,5.75rem)] font-bold leading-tight text-mist-50'
              }
            >
              <Sparkle className="size-[0.3em] shrink-0 text-blush-300" />
              {label}
            </span>
          </p>
        </div>
      </div>
    </TransitionContext>
  )
}

/** 站内链接：和 react-router 的 Link 用法一样，点击时走幕布转场 */
export function TLink({ to, onClick, target, ...rest }: LinkProps) {
  const go = useTransitionNav()
  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(e)
    // 新标签页打开、按着修饰键点击这些情况交还给浏览器
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    if (typeof to !== 'string' || target === '_blank') return
    e.preventDefault()
    go(to)
  }
  return <Link to={to} target={target} onClick={handleClick} {...rest} />
}
