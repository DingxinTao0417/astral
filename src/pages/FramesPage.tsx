import { ImageTrail } from '../components/bits/ImageTrail'
import { Frames } from '../components/Frames'
import { PageHeader } from '../components/PageHeader'
import { frames } from '../content/site'
import { DESKTOP } from '../lib/gsap'
import { useMedia } from '../lib/hooks'

/** 页头上跟着鼠标出现的照片：隔一张取一张，各个分类都有 */
const TRAIL = frames.items.filter((_, i) => i % 2 === 0).map((item) => item.id)

export function FramesPage() {
  // 只在用鼠标的大屏上挂载，手机不用为这个效果多下载图片
  const desktop = useMedia(DESKTOP)
  return (
    <>
      <PageHeader index="04" eyebrow={frames.eyebrow} title={frames.title} intro={frames.intro}>
        {desktop && <ImageTrail ids={TRAIL} className="-z-10" />}
      </PageHeader>
      <Frames />
    </>
  )
}
