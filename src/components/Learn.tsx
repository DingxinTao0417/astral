import { useMemo, useState } from 'react'
import { learnItems, learnSamples, type LearnItem } from '../content/learn'
import { brand, learn } from '../content/site'
import { trackSpotlight } from '../lib/hooks'
import { ArrowUpRight, Check, Copy, Play, Sparkle } from './Icons'
import { Reveal } from './Reveal'

// 还没有正式资料时，本地预览用示例顶上，方便看版式；正式网站上不会出现示例
const SHOWING_SAMPLES = import.meta.env.DEV && learnItems.length === 0
const ITEMS = SHOWING_SAMPLES ? learnSamples : learnItems

/** 「AI」页的正文：按分类筛选的资料卡片 */
export function Learn() {
  const [topic, setTopic] = useState<string | null>(null)
  const topics = useMemo(() => [...new Set(ITEMS.map((item) => item.topic))], [])
  const items = topic ? ITEMS.filter((item) => item.topic === topic) : ITEMS

  if (ITEMS.length === 0) return <Empty />

  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 md:pb-24">
      {SHOWING_SAMPLES && (
        <p className="mb-7 rounded-2xl border border-dashed border-blush-300/60 bg-blush-300/10 px-5 py-3.5 text-sm leading-7 text-blush-100">
          下面三张是示例，只在本地预览时显示，正式网站上不会出现。在 src/content/learn.ts 里加上第一条正式资料后，示例会自动消失。
        </p>
      )}

      {topics.length > 1 && (
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          <button type="button" className="chip shrink-0 px-4 py-2 text-sm" aria-pressed={!topic} onClick={() => setTopic(null)}>
            {learn.allTopics}
            <span className="font-mono text-[10px] opacity-60">{ITEMS.length}</span>
          </button>
          {topics.map((name) => (
            <button
              key={name}
              type="button"
              className="chip shrink-0 px-4 py-2 text-sm"
              aria-pressed={topic === name}
              onClick={() => setTopic(name)}
            >
              {name}
              <span className="font-mono text-[10px] opacity-60">
                {ITEMS.filter((item) => item.topic === name).length}
              </span>
            </button>
          ))}
        </div>
      )}

      <ul key={topic} className="mt-7 grid gap-4 md:mt-9 md:gap-5 lg:grid-cols-2">
        {items.map((item, i) => (
          <li key={item.id}>
            <Reveal className="h-full" delay={(i % 2) * 100}>
              <Card item={item} />
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Card({ item }: { item: LearnItem }) {
  return (
    <article className="card spot flex h-full flex-col overflow-hidden p-6 md:p-9" onPointerMove={trackSpotlight}>
      <p className="flex items-center gap-3">
        <span className="rounded-full bg-linear-to-r from-blush-200 to-iris-300 px-3 py-1 text-xs font-medium text-night-800">
          {item.topic}
        </span>
        <time dateTime={item.date} className="font-mono text-[11px] tracking-[0.16em] text-mist-400">
          {item.date.replaceAll('-', '.')}
        </time>
      </p>
      {/* 标题用系统字体而不是标题宋体：这样加新资料不用重新生成字体 */}
      <h2 className="mt-5 text-pretty text-xl font-semibold leading-snug text-mist-50 md:text-2xl">{item.title}</h2>
      <p className="mt-3 text-pretty text-[15px] leading-8 text-mist-300">{item.summary}</p>

      {item.prompt && <Prompt text={item.prompt} />}

      {item.notes && (
        <ul className="mt-5 space-y-2 text-[15px] leading-7 text-mist-300">
          {item.notes.map((note) => (
            <li key={note} className="flex gap-3">
              <Sparkle className="mt-2.5 size-2 shrink-0 text-blush-400" />
              {note}
            </li>
          ))}
        </ul>
      )}

      {(item.video || item.links) && (
        <div className="mt-auto flex flex-wrap items-center gap-2.5 pt-7">
          {item.video && (
            <a href={item.video} target="_blank" rel="noreferrer" className="btn btn-primary h-11 px-5 text-sm">
              <Play className="size-3.5" />
              {learn.videoCta}
            </a>
          )}
          {item.links?.map((link) => (
            <a
              key={link.label}
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="btn btn-ghost h-11 px-5 text-sm"
            >
              {link.label}
              <ArrowUpRight className="size-4" />
            </a>
          ))}
        </div>
      )}
    </article>
  )
}

/** 提示词框：等宽字体显示，右上角一键复制 */
function Prompt({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2200)
    } catch {
      // 个别内嵌浏览器不给剪贴板权限：文字本身可以长按选中复制
    }
  }

  return (
    <div className="relative mt-5 rounded-2xl border border-white/12 bg-night-950/60">
      <button
        type="button"
        onClick={copy}
        className="absolute right-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full border border-white/15 bg-night-800/90 px-3 py-1.5 text-xs text-mist-100 transition-colors hover:bg-night-700"
      >
        {copied ? <Check className="size-3.5 text-blush-300" /> : <Copy className="size-3.5" />}
        <span aria-live="polite">{copied ? learn.copied : learn.copyCta}</span>
      </button>
      <pre className="max-h-56 overflow-auto whitespace-pre-wrap break-words px-5 pb-5 pt-12 font-mono text-[13px] leading-7 text-mist-100">
        {text}
      </pre>
    </div>
  )
}

/** 一条资料都没有时的样子 */
function Empty() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-16 md:pb-24">
      <div className="card flex flex-col items-center px-6 py-16 text-center md:py-24">
        <Sparkle className="animate-spin-slow size-9 text-blush-300" />
        <h2 className="mt-7 font-serif text-[clamp(1.8rem,5vw,2.75rem)] font-bold text-mist-50">{learn.emptyTitle}</h2>
        <p className="mt-4 max-w-md text-pretty text-[15px] leading-8 text-mist-300 md:text-base">{learn.emptyBody}</p>
        <a href={brand.douyinUrl} target="_blank" rel="noreferrer" className="btn btn-primary mt-9 h-13 px-7 text-[15px]">
          {learn.emptyCta}
          <ArrowUpRight className="size-4" />
        </a>
      </div>
    </section>
  )
}
