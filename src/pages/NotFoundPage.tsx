import { Link } from 'react-router'
import { ArrowRight } from '../components/Icons'
import { PageHeader } from '../components/PageHeader'

export function NotFoundPage() {
  return (
    <>
      <PageHeader index="00" eyebrow="Not found" title="页面不存在" intro="链接可能写错了，或者这个页面已经搬走。" />
      <div className="mx-auto max-w-6xl px-5 pb-24">
        <Link to="/" className="btn btn-primary h-13 px-7 text-[15px]">
          回到首页
          <ArrowRight className="size-4" />
        </Link>
      </div>
    </>
  )
}
