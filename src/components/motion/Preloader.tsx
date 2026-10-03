import { useEffect } from 'react'
import { gsap, SplitText } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/hooks'
import { stage } from '../../lib/stage'

const SEEN_KEY = 'astral:intro-seen'
/** 完整开场最短放多久（毫秒）：再快也让数字跳完，不然只是一闪 */
const MIN_SHOW = 1250
/** 最多等多久：网再慢也不让访客一直看加载页 */
const MAX_WAIT = 2800

const wait = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms))

/** 这次打开（同一个标签页）是不是已经看过完整开场了 */
function hasSeenIntro() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === '1'
  } catch {
    return false
  }
}

/**
 * 开场加载页。画面本身写在 index.html 里（#boot），这里只负责让它动起来：
 * 数字跟着字体和首屏图片的加载进度走到 100，然后五块幕布依次上拉，露出页面。
 * 同一个标签页里再次刷新就不重放数字了，只拉一次幕布。
 */
export function Preloader() {
  useEffect(() => {
    const boot = document.getElementById('boot')
    if (!boot) {
      stage.open()
      return
    }
    if (prefersReducedMotion()) {
      boot.remove()
      stage.open()
      return
    }

    let alive = true
    const q = gsap.utils.selector(boot)
    const word = q('.boot-word')[0]
    const meta = q('.boot-meta')[0]
    const count = q('.boot-count')[0]
    const line = q('.boot-line')[0]
    const star = q('.boot-star')[0]
    const panels = q('.boot-panels i')
    const quick = hasSeenIntro()
    const startedAt = performance.now()

    const fonts = Promise.all([
      document.fonts.load('italic 1em "Instrument Serif"'),
      document.fonts.load('1em "Instrument Serif"'),
      document.fonts.load('700 1em "Noto Serif SC Sub"', '新星'),
      document.fonts.load('1em "DM Mono"'),
    ]).catch(() => undefined)
    const images = Promise.all(
      [...document.querySelectorAll<HTMLImageElement>('img[loading="eager"]')].map((img) =>
        img.decode().catch(() => undefined),
      ),
    )
    const ready = Promise.race([Promise.all([fonts, images]), wait(MAX_WAIT)])

    // 最后一道保险：不管中间哪一步出了岔子，9 秒后一定把加载页收走、让页面开演
    const failsafe = window.setTimeout(() => {
      boot.remove()
      stage.open()
    }, 9000)

    const ctx = gsap.context(() => {
      // 保险动画（index.html 里那个 6 秒后自动淡出）交给这里接管
      gsap.set(boot, { animation: 'none' })

      const leave = (reveal: () => void) =>
        gsap
          .timeline({
            onComplete: () => {
              try {
                sessionStorage.setItem(SEEN_KEY, '1')
              } catch {
                // 隐私模式下存不了就算了，下次再放一遍完整开场
              }
              window.clearTimeout(failsafe)
              boot.remove()
            },
          })
          .add(reveal, 0)
          // 简化版开场里数字和进度条本来就没露面，不能去「淡出」它们，不然反而会先闪出来一下
          .to(quick ? star : [star, meta, line], { autoAlpha: 0, duration: 0.3, ease: 'power1.out' }, 0.05)
          .to(panels, { yPercent: -101, duration: 0.95, ease: 'curtain', stagger: 0.07 }, 0.3)
          .add(() => stage.open(), 0.55)

      if (quick) {
        // 注意别把时间线从 then 里返回出去：GSAP 的时间线自带 then，Promise 会傻等它播完
        void ready.then(() => {
          if (alive) ctx.add(() => leave(() => {}))
        })
        return
      }

      const split = new SplitText(word, { type: 'chars' })
      gsap.set(split.chars, { yPercent: 118 })
      const progress = { value: 0 }
      const paint = () => {
        count.textContent = String(Math.round(progress.value))
        gsap.set(line, { scaleX: progress.value / 100 })
      }

      // 字体到了再让字出来，免得先看到一眼系统字体
      const enter = gsap
        .timeline({ paused: true })
        .set([word, meta], { visibility: 'visible' })
        .to(split.chars, { yPercent: 0, duration: 0.9, stagger: 0.045 }, 0)
        .from(meta, { opacity: 0, duration: 0.5, ease: 'power1.out' }, 0)
      void Promise.race([fonts, wait(1200)]).then(() => {
        if (alive) enter.play()
      })

      // 先自己走到 78，等东西真的加载好了再走完剩下的
      gsap.to(progress, { value: 78, duration: 1.1, ease: 'power2.out', onUpdate: paint })
      void ready.then(() => {
        if (!alive) return
        const hold = Math.max(0, MIN_SHOW - (performance.now() - startedAt)) / 1000
        ctx.add(() => {
          gsap.to(progress, {
            value: 100,
            duration: 0.5,
            delay: hold,
            ease: 'power2.inOut',
            overwrite: true,
            onUpdate: paint,
            onComplete: () => {
              ctx.add(() =>
                leave(() => {
                  enter.progress(1)
                  gsap.to(split.chars, { yPercent: -118, duration: 0.55, ease: 'power3.in', stagger: 0.03 })
                }),
              )
            },
          })
        })
      })
    })

    return () => {
      alive = false
      window.clearTimeout(failsafe)
      ctx.revert()
    }
  }, [])

  return null
}
