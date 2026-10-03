import { Learn } from '../components/Learn'
import { PageHeader } from '../components/PageHeader'
import { learn } from '../content/site'

export function LearnPage() {
  return (
    <>
      <PageHeader index="01" eyebrow={learn.eyebrow} title={learn.title} intro={learn.intro} />
      <Learn />
    </>
  )
}
