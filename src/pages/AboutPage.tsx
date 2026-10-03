import { About } from '../components/About'
import { PageHeader } from '../components/PageHeader'
import { about } from '../content/site'

export function AboutPage() {
  return (
    <>
      <PageHeader index="05" eyebrow={about.eyebrow} title={about.title} intro={about.paragraphs[0]} />
      <About />
    </>
  )
}
