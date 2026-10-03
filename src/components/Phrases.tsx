interface PhrasesProps {
  text: string
  /** 断句用的标点。传数组表示逐级拆分，例如 ['。', '，'] 先按句、句内再按逗号 */
  by?: string | string[]
}

/**
 * 把一句话按标点拆成几段，每段尽量整段换行，避免中文在词中间被折断。
 * 标题按逗号拆（默认），正文先按句号再按逗号拆。段落本身比容器还宽时照常折行。
 */
export function Phrases({ text, by = '，' }: PhrasesProps) {
  const [mark, ...rest] = Array.isArray(by) ? by : [by]
  const parts = text
    .split(mark)
    .map((part, i, all) => (i < all.length - 1 ? part + mark : part))
    .filter(Boolean)
  return (
    <>
      {parts.map((part, i) => (
        <span key={i} className="inline-block">
          {rest.length > 0 ? <Phrases text={part} by={rest} /> : part}
        </span>
      ))}
    </>
  )
}
