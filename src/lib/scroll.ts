import type Lenis from 'lenis'

/**
 * 平滑滚动（Lenis）的全局句柄。SmoothScroll 组件负责创建和销毁，
 * 其他地方通过这里锁滚动、回到顶部，不用关心 Lenis 有没有启用。
 */
let lenis: Lenis | null = null
let locks = 0

export const scroller = {
  attach(instance: Lenis | null) {
    lenis = instance
    if (instance && locks > 0) instance.stop()
  },

  /** 立刻回到页面顶部（换页时用） */
  toTop() {
    if (lenis) lenis.scrollTo(0, { immediate: true, force: true })
    else window.scrollTo({ top: 0, behavior: 'instant' })
  },

  /** 滚动到某个位置（像素），带缓动 */
  to(y: number, duration = 1.1) {
    if (lenis) lenis.scrollTo(y, { duration })
    else window.scrollTo({ top: y })
  },

  /** 锁住页面滚动（开大图、开菜单时）。可以叠加，解锁次数对上才真的放开 */
  lock() {
    if (++locks > 1) return
    lenis?.stop()
    document.documentElement.style.overflow = 'hidden'
  },
  unlock() {
    if (locks === 0 || --locks > 0) return
    lenis?.start()
    document.documentElement.style.overflow = ''
  },
}
