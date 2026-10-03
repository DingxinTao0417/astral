import { Gateway } from '../components/Gateway'
import { Hero } from '../components/Hero'
import { SloganBand } from '../components/SloganBand'
import { Stats } from '../components/Stats'
import { brand } from '../content/site'

export function HomePage() {
  return (
    <>
      <title>{`${brand.name} ${brand.cnName}｜${brand.slogan.replace(/[，。]/g, '')}`}</title>
      <Hero />
      <Stats />
      <Gateway />
      <SloganBand />
    </>
  )
}
