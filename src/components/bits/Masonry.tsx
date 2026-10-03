import { useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { cx } from '../../lib/cx'
import { gsap, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { prefersReducedMotion } from '../../lib/hooks'
import { stage } from '../../lib/stage'

export interface MasonryItem {
  id: string
  /** 高 ÷ 宽 */
  ratio: number
}

interface MasonryProps<T extends MasonryItem> {
  /** 全部条目。顺序固定，筛选只影响显示与否 */
  items: T[]
  /** 当前要显示的条目 id；不在里面的会淡出并让出位置 */
  visibleIds: string[]
  columns: number
  /** 列间距和行间距，像素 */
  gap: number
  /** 画出一个条目的内容，会被放进一个已经定好位置和尺寸的格子里 */
  children: (item: T) => ReactNode
  className?: string
}

interface Box {
  x: number
  y: number
  w: number
  h: number
}

/** 量容器的宽度，变化时更新 */
function useWidth<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setWidth(el.clientWidth)
    const resizer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)))
    resizer.observe(el)
    return () => resizer.disconnect()
  }, [])
  return [ref, width] as const
}

/**
 * 瀑布流：按顺序把每个条目放进当前最矮的一列。位置全部用 GSAP 来摆，
 * 所以换筛选条件、窗口变宽变窄时，留下的条目会「滑」到新位置，而不是整块闪一下重排。
 *
 * 来自 React Bits（reactbits.dev）的 Masonry，保留了它的排版算法和「从模糊到清晰」的进场，改动：
 * - 加了筛选：不显示的条目淡出缩小、从排版里拿掉，新出现的在自己的位置上淡入；
 * - 进场跟着滚动走（滚到哪张哪张才出现），而不是一打开全部飞进来；
 * - 内容由调用方画（这里是带镭射边的照片 + 点开大图），不再写死成背景图链接；
 * - 列数和间距由调用方决定。
 */
export function Masonry<T extends MasonryItem>({
  items,
  visibleIds,
  columns,
  gap,
  children,
  className,
}: MasonryProps<T>) {
  const [list, width] = useWidth<HTMLUListElement>()
  const laidOut = useRef(false)
  const shown = useRef(new Set<string>())

  const layout = useMemo(() => {
    if (!width) return null
    const visible = new Set(visibleIds)
    const heights = new Array<number>(columns).fill(0)
    const columnWidth = (width - gap * (columns - 1)) / columns
    const boxes = new Map<string, Box>()
    for (const item of items) {
      if (!visible.has(item.id)) continue
      const column = heights.indexOf(Math.min(...heights))
      const h = columnWidth * item.ratio
      boxes.set(item.id, { x: column * (columnWidth + gap), y: heights[column], w: columnWidth, h })
      heights[column] += h + gap
    }
    return { boxes, height: Math.max(0, Math.max(...heights) - gap) }
  }, [items, visibleIds, columns, gap, width])

  useGSAP(
    (_, contextSafe) => {
      const el = list.current
      if (!el || !layout) return
      const still = prefersReducedMotion()
      const cells = gsap.utils.toArray<HTMLElement>('[data-cell-id]', el)
      const boxOf = (cell: HTMLElement) => layout.boxes.get(cell.dataset.cellId!)
      const place = (box: Box) => ({ x: box.x, y: box.y, width: box.w, height: box.h })

      // ── 第一次排版：直接摆好位置，然后滚到哪张、哪张从模糊到清晰浮上来 ──
      if (!laidOut.current) {
        laidOut.current = true
        shown.current = new Set(layout.boxes.keys())
        gsap.set(el, { height: layout.height })
        cells.forEach((cell) => {
          const box = boxOf(cell)
          gsap.set(cell, box ? { ...place(box), autoAlpha: still ? 1 : 0 } : { autoAlpha: 0, scale: 0.8 })
        })
        if (still) return
        return stage.whenOpen(
          contextSafe!(() => {
            cells.forEach((cell, i) => {
              const box = boxOf(cell)
              if (!box) return
              gsap.fromTo(
                cell,
                { autoAlpha: 0, y: box.y + 90, filter: 'blur(10px)' },
                {
                  autoAlpha: 1,
                  y: box.y,
                  filter: 'blur(0px)',
                  duration: 1.1,
                  delay: (i % columns) * 0.08,
                  clearProps: 'filter',
                  scrollTrigger: { trigger: cell, start: 'top 98%', once: true },
                },
              )
            })
          }),
        )
      }

      // ── 之后每次重排（换筛选、窗口变宽变窄）：留下的滑到新位置，离开的淡出，新来的原地淡入 ──
      const duration = still ? 0 : 0.8
      gsap.to(el, {
        height: layout.height,
        duration,
        ease: 'silk',
        overwrite: true,
        onComplete: () => ScrollTrigger.refresh(),
      })
      cells.forEach((cell) => {
        const box = boxOf(cell)
        if (!box) {
          gsap.to(cell, { autoAlpha: 0, scale: 0.8, duration: duration * 0.45, ease: 'power2.out', overwrite: true })
        } else if (shown.current.has(cell.dataset.cellId!)) {
          gsap.to(cell, {
            ...place(box),
            autoAlpha: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration,
            ease: 'silk',
            overwrite: true,
            clearProps: 'filter',
          })
        } else {
          gsap.killTweensOf(cell)
          gsap.set(cell, place(box))
          gsap.fromTo(
            cell,
            { autoAlpha: 0, scale: 0.8 },
            { autoAlpha: 1, scale: 1, duration: duration * 0.8, delay: duration * 0.2, ease: 'silk' },
          )
        }
      })
      shown.current = new Set(layout.boxes.keys())
    },
    { dependencies: [layout], scope: list },
  )

  return (
    <ul ref={list} className={cx('relative', className)}>
      {items.map((item) => (
        <li key={item.id} data-cell-id={item.id} className="invisible absolute left-0 top-0 will-change-transform">
          {children(item)}
        </li>
      ))}
    </ul>
  )
}
