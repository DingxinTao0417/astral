import type { ImgHTMLAttributes } from 'react'
import { getMedia } from '../content/media'

interface ImgProps
  extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'srcSet' | 'width' | 'height' | 'alt'> {
  /** media.json 里的素材 id */
  id: string
  alt: string
  /** 首屏图片设为 true，不走懒加载 */
  eager?: boolean
  /** 固定用小图或大图；默认按 sizes 让浏览器自己挑 */
  variant?: 'sm' | 'lg'
}

export function Img({ id, alt, eager, variant, sizes, style, ...rest }: ImgProps) {
  const m = getMedia(id)
  const source =
    variant === 'sm'
      ? { src: m.sm }
      : variant === 'lg'
        ? { src: m.src }
        : {
            src: m.sm,
            srcSet: `${m.sm} ${m.smW}w, ${m.src} ${m.w}w`,
            sizes: sizes ?? '(min-width: 1024px) 45vw, 92vw',
          }
  return (
    <img
      {...source}
      width={m.w}
      height={m.h}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      draggable={false}
      style={{ backgroundColor: m.color, ...style }}
      {...rest}
    />
  )
}
