import manifest from './media.json'

export interface MediaItem {
  /** 大图，长边最多 1600px */
  src: string
  /** 小图，长边最多 720px */
  sm: string
  w: number
  h: number
  smW: number
  /** 主色，图片加载前的占位色 */
  color: string
}

const media = manifest as Record<string, MediaItem>

export function getMedia(id: string): MediaItem {
  const item = media[id]
  if (!item) throw new Error(`找不到素材「${id}」，先在 scripts/build-media.mjs 里登记再运行 npm run media`)
  return item
}
