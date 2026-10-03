import { Experience } from '../components/Experience'
import { PageHeader } from '../components/PageHeader'
import { experience } from '../content/site'

export function ExperiencePage() {
  return (
    <>
      <PageHeader index="03" eyebrow={experience.eyebrow} title={experience.title} intro={experience.intro} />
      <Experience />
    </>
  )
}
