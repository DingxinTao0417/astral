/**
 * 「AI」页（AI 学习）的资料清单。
 *
 * 抖音上讲过一期内容，就在下面的 learnItems 里加一条，网站上会多出一张卡片。
 * 新的放最前面。只有 id、title、summary、topic、date 是必填，其余用得到再写。
 */

export interface LearnItem {
  /** 唯一标识，英文小写加短横线，例如 'white-bg-banner' */
  id: string
  title: string
  /** 一两句话：这期讲了什么、资料里有什么 */
  summary: string
  /** 分类，会自动变成页面顶部的筛选标签。例如：提示词 / 工作流 / 工具 */
  topic: string
  /** 日期，格式 2026-10-03 */
  date: string
  /** 对应的抖音视频链接 */
  video?: string
  /** 可以一键复制的提示词 */
  prompt?: string
  /** 补充说明，一段一条 */
  notes?: string[]
  /** 资料下载、网盘、工具官网等链接 */
  links?: { label: string; url: string }[]
}

/** 正式资料加在这里 */
export const learnItems: LearnItem[] = []

/**
 * 示例。只在本地预览（npm run dev）而且上面还一条正式资料都没有的时候显示，
 * 用来看版式，不会出现在正式网站上。照着这个格式往 learnItems 里加就行。
 */
export const learnSamples: LearnItem[] = [
  {
    id: 'sample-prompt',
    title: '示例：这里是一期视频的标题',
    summary: '这里写一两句话，说明这期讲了什么、资料里有什么。带提示词的资料，下面会多出一个可以一键复制的框。',
    topic: '提示词',
    date: '2026-10-03',
    video: 'https://www.douyin.com/',
    prompt:
      '这里放视频里用到的提示词。\n可以写多行，访客点右上角的按钮就能整段复制。\n\n[主体] + [场景] + [光线] + [镜头] + [风格]',
  },
  {
    id: 'sample-workflow',
    title: '示例：带补充说明和下载链接的资料',
    summary: '不带提示词也可以，只放说明文字和链接。',
    topic: '工作流',
    date: '2026-09-28',
    video: 'https://www.douyin.com/',
    notes: ['补充说明写在这里，一段一条。', '比如步骤、注意事项、踩过的坑。'],
    links: [
      { label: '资料下载', url: 'https://www.douyin.com/' },
      { label: '工具官网', url: 'https://www.douyin.com/' },
    ],
  },
  {
    id: 'sample-tool',
    title: '示例：最简单的一条',
    summary: '只有标题、简介和视频链接。',
    topic: '工具',
    date: '2026-09-20',
    video: 'https://www.douyin.com/',
  },
]
