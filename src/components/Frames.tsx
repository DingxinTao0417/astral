import { useEffect, useMemo, useState, type CSSProperties } from 'react'
import { getMedia } from '../content/media'
import { frames, type FrameCategory } from '../content/site'
import { Holo } from './Holo'
import { Expand } from './Icons'
import { Img } from './Img'
import { useLightbox } from './Lightbox'

type Category = 'all' | FrameCategory

/** 手机 2 列、平板 3 列、桌面 4 列 */
function useColumnCount() {
  const read = () =>
    window.matchMedia('(min-width: 1024px)').matches ? 4 : window.matchMedia('(min-width: 768px)').matches ? 3 : 2
  const [count, setCount] = useState(read)
  useEffect(() => {
    const onResize = () => setCount(read())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return count
}

/** 「影像」页的正文：分类筛选 + 瀑布流，点开看大图 */
export function Frames() {
  const [category, setCategory] = useState<Category>('all')
  const columnCount = useColumnCount()
  const open = useLightbox()

  const items = useMemo(
    () => (category === 'all' ? frames.items : frames.items.filter((item) => item.cat === category)),
    [category],
  )

  // 瀑布流：按顺序把每张图放进当前最矮的一列，这样第一排就是清单里的前几张
  const columns = useMemo(() => {
    const cols = Array.from({ length: columnCount }, () => ({ height: 0, entries: [] as number[] }))
    items.forEach((item, index) => {
      const m = getMedia(item.id)
      const shortest = cols.reduce((a, b) => (b.height < a.height ? b : a))
      shortest.entries.push(index)
      shortest.height += m.h / m.w
    })
    return cols
  }, [items, columnCount])

  const countOf = (key: Category) =>
    key === 'all' ? frames.items.length : frames.items.filter((item) => item.cat === key).length

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 md:pb-24">
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {frames.categories.map((c) => (
          <button
            key={c.key}
            type="button"
            className="chip shrink-0 px-4 py-2 text-sm"
            aria-pressed={c.key === category}
            onClick={() => setCategory(c.key)}
          >
            {c.label}
            <span className="font-mono text-[10px] opacity-60">{countOf(c.key)}</span>
          </button>
        ))}
      </div>

      {/* key 换了会整体重挂载，让筛选后的图重新依次浮现 */}
      <div key={category} className="mt-7 flex items-start gap-3 md:mt-9 md:gap-5">
        {columns.map((column, c) => (
          <ul key={c} className="flex min-w-0 flex-1 flex-col gap-3 md:gap-5">
            {column.entries.map((index) => {
              const item = items[index]
              const m = getMedia(item.id)
              return (
                <li key={item.id} className="rise" style={{ '--d': `${Math.min(index, 12) * 55}ms` } as CSSProperties}>
                  <button type="button" className="group block w-full" onClick={() => open(items, index)}>
                    <Holo className="holo-quiet" tilt={8} style={{ aspectRatio: `${m.w} / ${m.h}` }}>
                      <Img
                        id={item.id}
                        alt={item.caption}
                        sizes="(min-width: 1024px) 272px, (min-width: 768px) 31vw, 46vw"
                        className="size-full object-cover"
                      />
                      <span className="absolute inset-0 z-3 flex items-end justify-between gap-2 rounded-[inherit] bg-linear-to-t from-night-950/85 via-transparent to-transparent p-3 text-left text-xs text-mist-50 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100">
                        {item.caption}
                        <Expand className="size-4 shrink-0" />
                      </span>
                    </Holo>
                  </button>
                </li>
              )
            })}
          </ul>
        ))}
      </div>
    </section>
  )
}
