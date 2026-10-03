import { useEffect, useMemo, useState } from 'react'
import { getMedia } from '../content/media'
import { frames, type FrameCategory } from '../content/site'
import { Masonry } from './bits/Masonry'
import { Holo } from './Holo'
import { Expand } from './Icons'
import { Img } from './Img'
import { useLightbox } from './Lightbox'
import { Reveal } from './Reveal'

type Category = 'all' | FrameCategory

/** 手机 2 列、平板 3 列、桌面 4 列 */
function useColumns() {
  const read = () => {
    const columns = window.matchMedia('(min-width: 1024px)').matches
      ? 4
      : window.matchMedia('(min-width: 768px)').matches
        ? 3
        : 2
    return { columns, gap: columns === 2 ? 12 : 20 }
  }
  const [value, setValue] = useState(read)
  useEffect(() => {
    const onResize = () => setValue((prev) => (prev.columns === read().columns ? prev : read()))
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return value
}

/** 瀑布流要用到每张照片的高宽比 */
const PHOTOS = frames.items.map((item) => {
  const m = getMedia(item.id)
  return { ...item, ratio: m.h / m.w }
})

/** 「影像」页的正文：分类筛选 + 瀑布流，点开看大图 */
export function Frames() {
  const [category, setCategory] = useState<Category>('all')
  const { columns, gap } = useColumns()
  const open = useLightbox()

  // 当前分类下的照片；点开大图后左右翻页也只在这些照片里翻
  const visible = useMemo(
    () => (category === 'all' ? frames.items : frames.items.filter((item) => item.cat === category)),
    [category],
  )
  const visibleIds = useMemo(() => visible.map((item) => item.id), [visible])

  const countOf = (key: Category) =>
    key === 'all' ? frames.items.length : frames.items.filter((item) => item.cat === key).length

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 md:pb-24">
      <Reveal>
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
      </Reveal>

      <Masonry items={PHOTOS} visibleIds={visibleIds} columns={columns} gap={gap} className="mt-7 md:mt-9">
        {(item) => (
          <button
            type="button"
            data-cursor="查看"
            className="group block size-full"
            onClick={() => open(visible, Math.max(0, visible.findIndex((v) => v.id === item.id)))}
          >
            <Holo className="holo-quiet size-full" tilt={8} data-lightbox-thumb={item.id}>
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
        )}
      </Masonry>
    </section>
  )
}
