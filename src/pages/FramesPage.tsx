import { Frames } from '../components/Frames'
import { PageHeader } from '../components/PageHeader'
import { frames } from '../content/site'

export function FramesPage() {
  return (
    <>
      <PageHeader index="04" eyebrow={frames.eyebrow} title={frames.title} intro={frames.intro} />
      <Frames />
    </>
  )
}
