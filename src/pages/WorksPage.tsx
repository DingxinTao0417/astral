import { PageHeader } from '../components/PageHeader'
import { Works } from '../components/Works'
import { works } from '../content/site'

export function WorksPage() {
  return (
    <>
      <PageHeader index="02" eyebrow={works.eyebrow} title={works.title} intro={works.intro} />
      <Works />
    </>
  )
}
