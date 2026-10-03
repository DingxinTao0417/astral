/**
 * 「舞台」：页面此刻有没有被开场加载页或转场幕布盖住。
 * 各页面的进场动画先排好、暂停着，等幕布拉开的那一刻再一起开演，
 * 这样不会出现「动画在幕布后面已经播完了」的情况。
 */
type Listener = () => void

let isOpen = false
const waiting = new Set<Listener>()

export const stage = {
  get isOpen() {
    return isOpen
  },
  /** 幕布拉开，通知所有等着的进场动画 */
  open() {
    isOpen = true
    const queue = [...waiting]
    waiting.clear()
    queue.forEach((run) => run())
  },
  /** 幕布合上（开始转场） */
  close() {
    isOpen = false
  },
  /** 幕布拉开时执行；如果本来就开着，立刻执行。返回取消函数 */
  whenOpen(run: Listener): () => void {
    if (isOpen) {
      run()
      return () => {}
    }
    waiting.add(run)
    return () => waiting.delete(run)
  },
}
