/**
 * 全站文案与链接都在这个文件里，改文字只需要改这里。
 * 图片用 id 引用，id 对应 scripts/build-media.mjs 里的清单。
 * 改了标题类文字（见文件末尾 displayText）后运行 `npm run fonts`，重新生成标题用的宋体子集。
 */

export const brand = {
  /** 首屏大字 */
  name: 'Astral',
  cnName: '新星实验室',
  /** 抖音账号全称 */
  account: 'Astral新星实验室',
  owner: '星辉',
  slogan: '把审美语言，转成技术语言。',
  /** 抖音主页，全站所有「去抖音」的按钮都指向这里 */
  douyinUrl:
    'https://www.douyin.com/user/MS4wLjABAAAAC_T8-Qm_bLIXJybb-IX5WD1jBeZ0EtFIFPhUu_bvBizfaxflUuNzFAW_vpM5CK3l',
}

/** 导航里的子页面 */
export const nav = [
  { to: '/ai', label: 'AI' },
  { to: '/works', label: '作品' },
  { to: '/experience', label: '经历' },
  { to: '/frames', label: '影像' },
  { to: '/about', label: '关于' },
]

export const hero = {
  intro:
    '我是星辉，一个做了十年内容的创作者。现在，我把拍摄、剪辑和卖货的经验，都用在了 AI 上。',
  primaryCta: '去抖音找我',
  secondaryCta: '看 AI 作品',
  /** 首屏底部扇形排开的作品卡，从左到右；to 是点击后去的页面 */
  fan: [
    { id: 'banner-clip', label: '电商视觉', to: '/works' },
    { id: 'portrait-3', label: '人像', to: '/frames' },
    { id: 'aerial-1', label: '航拍', to: '/frames' },
    { id: 'aigc-film-poster', label: 'AIGC 视频', to: '/works' },
    { id: 'aerial-3', label: '航拍', to: '/frames' },
  ],
}

/** 首页的入口卡片，分别通向各个子页面。kind 决定卡片上半部分的画面，见 Gateway.tsx */
export const home = {
  eyebrow: 'Explore',
  title: '内容导览',
  intro: 'AI 学习资料、作品、经历、摄影，还有我自己。',
  entries: [
    {
      kind: 'learn',
      to: '/ai',
      title: 'AI 学习',
      desc: '抖音上讲过的内容，配套资料放在这里。',
      cta: '去看资料',
    },
    {
      kind: 'works',
      to: '/works',
      title: 'AI 作品',
      desc: 'AIGC 商业视频，和一张白底图做完一套电商视觉。',
      cta: '看 AI 作品',
    },
    {
      kind: 'experience',
      to: '/experience',
      title: 'AI 之前的十年',
      desc: '做内容、起号、卖货、拍片。工具会换，判断力不会。',
      cta: '看经历',
    },
    {
      kind: 'frames',
      to: '/frames',
      title: '影像作品',
      desc: '人像、产品、美食、航拍，二十张照片。',
      cta: '看照片',
    },
    {
      kind: 'about',
      to: '/about',
      title: '关于我',
      desc: '我是星辉，一个做了十年内容的创作者。',
      cta: '认识我',
    },
  ],
} as const

/** 「AI」页（AI 学习）的标题和提示文字。资料本身在 learn.ts 里添加 */
export const learn = {
  eyebrow: 'AI Learning',
  title: 'AI 学习',
  intro: '抖音上讲过的内容，配套的资料放在这里。',
  emptyTitle: '资料正在整理中',
  emptyBody: '视频里提到的提示词、工作流和工具清单，会陆续放上来。可以先去抖音关注，更新了第一时间能看到。',
  emptyCta: '去抖音关注',
  videoCta: '看这期视频',
  copyCta: '复制提示词',
  copied: '已复制',
  allTopics: '全部',
}

/** 首屏底部滚动的工具条 */
export const tools = [
  'Stable Diffusion',
  'Nano Banana',
  'GPT Image 2',
  '可灵',
  '即梦',
  'Vidu',
  'Coze',
  'Codex',
  'DeepSeek',
  'Photoshop',
  'Premiere',
  'After Effects',
  'Figma',
]

export const stats = [
  { value: 7, unit: '万+', label: 'B 站粉丝' },
  { value: 461, unit: '万', label: '单条视频最高播放' },
  { value: 270, unit: '%', label: 'Kickstarter 达成率' },
  { value: 10, unit: '年', label: '内容创作' },
]

/** 「作品」页：AI 项目 */
export const works = {
  eyebrow: 'Works',
  title: 'AI 作品',
  intro: '两个把 AI 真正用进工作里的项目。不讲概念，只看做出来的东西。',

  film: {
    tag: '视频',
    title: 'AIGC 商业视频',
    body: '从卖点洞察、脚本和 Storyboard，到用 AIGC 生成素材、辅助镜头设计，再到剪辑和后期输出，做出能直接投放海外社媒的带货视频。',
    flow: ['卖点洞察', '脚本与分镜', 'AI 生成素材', '剪辑与后期', '社媒投放'],
    video: {
      src: '/media/aigc-film.mp4',
      poster: '/media/aigc-film-poster.webp',
      caption: '电动牙刷品宣短片 · AIGC 制作',
    },
    shotsTitle: '过程稿',
    shots: [
      { id: 'aigc-character', caption: '角色设定 · 橘白猫「鱼鱼」' },
      { id: 'aigc-storyboard', caption: '线稿分镜 → 成片画面' },
      { id: 'aigc-product', caption: '产品分镜 · 从线稿到渲染' },
    ],
  },

  visual: {
    tag: '电商视觉',
    title: '一张白底图，做完一套电商视觉',
    body: '摄影素材不够的时候，我用产品白底图直接生成卖点图和独立站 banner。这套方法用在了一次 270% 达成的 Kickstarter 众筹里。',
    hint: '左右拖动，对比前后',
    before: '白底图',
    after: 'AI 成品',
    pairs: [
      { name: '手套夹', before: 'white-clip', after: 'banner-clip' },
      { name: '器材箱', before: 'white-box', after: 'banner-box' },
    ],
    extrasTitle: '同一套方法做的卖点图',
    extras: [
      { id: 'selling-1', caption: '卖点图 · 结构拆解' },
      { id: 'selling-2', caption: '卖点图 · 功能特写' },
    ],
    result: { value: 270, unit: '%', label: 'Kickstarter 众筹达成' },
    credit: '出海影视器材品牌 openmoon 项目',
  },
}

export const experience = {
  eyebrow: 'Before AI',
  title: 'AI 之前的十年',
  intro: '工具会换，判断力不会。这些是我在 AI 出现之前，一条一条内容做出来的。',

  creator: {
    title: '做内容十年',
    body: '从 2016 年开始做自己的账号，选题、脚本、拍摄、剪辑、封面全部自己来，做出过多条百万播放的视频。',
    stats: [
      { value: '7', unit: '万+', label: 'B 站粉丝，峰值 8.3 万' },
      { value: '461', unit: '万', label: '单条视频最高播放' },
      { value: '962.9', unit: '万', label: 'B 站累计播放' },
    ],
  },

  sales: {
    title: '内容能卖货',
    body: '主导出海品牌的社媒与众筹宣发，Kickstarter 项目以 270% 完成目标。',
    percent: 270,
    caption: '众筹目标达成率',
  },

  growth: {
    title: '会起号',
    body: '从零开始把账号做起来，不止一次。',
    rows: [
      {
        from: '0',
        to: '1.3',
        unit: '万',
        label: 'B 站女性科普 IP「有胸青年」',
        note: '半年',
        href: 'https://space.bilibili.com/109603276',
      },
      { from: '3000', to: '1.1', unit: '万', label: '出海品牌 Instagram', note: '半年', href: '' },
    ],
  },

  film: {
    title: '影像是老本行',
    work: '《守护》',
    body: '品牌宣传片《守护》，从统筹策划、航拍、拍摄到剪辑一人完成。也负责过跨时区、多方连线的直播。',
    cta: '在 B 站看《守护》',
    href: 'https://www.bilibili.com/video/BV1KV4y1K7WD/',
  },
}

export type FrameCategory = 'portrait' | 'product' | 'food' | 'aerial'

export const frames: {
  eyebrow: string
  title: string
  intro: string
  categories: { key: 'all' | FrameCategory; label: string }[]
  items: { id: string; cat: FrameCategory; caption: string }[]
} = {
  eyebrow: 'Frames',
  title: '影像作品',
  intro: '人像、产品、美食、航拍。审美这件事，是一张一张拍出来的。',
  categories: [
    { key: 'all', label: '全部' },
    { key: 'portrait', label: '人像' },
    { key: 'product', label: '产品' },
    { key: 'food', label: '美食' },
    { key: 'aerial', label: '航拍' },
  ],
  // 顺序即「全部」里的排列顺序，穿插着放更好看
  items: [
    { id: 'portrait-2', cat: 'portrait', caption: '人像 · 室内暖光' },
    { id: 'aerial-1', cat: 'aerial', caption: '航拍 · 樱花河岸' },
    { id: 'product-1', cat: 'product', caption: '产品 · 器材箱' },
    { id: 'food-3', cat: 'food', caption: '美食 · 炖品' },
    { id: 'portrait-3', cat: 'portrait', caption: '人像 · 彩窗' },
    { id: 'product-5', cat: 'product', caption: '产品 · 咖啡杯' },
    { id: 'aerial-2', cat: 'aerial', caption: '航拍 · 雪山河谷' },
    { id: 'product-3', cat: 'product', caption: '产品 · 烫金书签' },
    { id: 'food-1', cat: 'food', caption: '美食 · 糯米饭' },
    { id: 'portrait-4', cat: 'portrait', caption: '人像 · 泳池' },
    { id: 'product-8', cat: 'product', caption: '产品 · 收纳标签包' },
    { id: 'aerial-3', cat: 'aerial', caption: '航拍 · 城市日落' },
    { id: 'product-2', cat: 'product', caption: '产品 · 场记板' },
    { id: 'food-2', cat: 'food', caption: '美食 · 橙盅' },
    { id: 'portrait-1', cat: 'portrait', caption: '人像 · 棚拍' },
    { id: 'product-4', cat: 'product', caption: '产品 · 烫金卡牌' },
    { id: 'product-7', cat: 'product', caption: '产品 · 数码收纳包' },
    { id: 'food-4', cat: 'food', caption: '美食 · 炖汤' },
    { id: 'product-6', cat: 'product', caption: '产品 · 器材箱组合' },
    { id: 'aerial-4', cat: 'aerial', caption: '航拍 · 广州塔夜景' },
  ],
}

export const about = {
  eyebrow: 'About',
  title: '关于我',
  portrait: 'portrait-2',
  portraitNote: '出镜的也是我',
  paragraphs: [
    '我是星辉。数字媒体技术专业出身，拍照、剪片、做账号，一做就是十年。',
    '做过品牌宣传片，带过出海品牌的社媒和众筹，也不止一次从零把账号做起来。还开过一家销量破万、零差评的同人周边小店。',
    '现在，我把这些经验搬进 AI：做 AIGC 视频，研究怎么让一张白底图变成一整套视觉。做出来的东西，都记录在「Astral新星实验室」。',
  ],
  kits: [
    {
      title: 'AI 工具箱',
      items: [
        'Stable Diffusion（本地部署）',
        'Nano Banana',
        'GPT Image 2',
        '可灵',
        '即梦',
        'Vidu',
        'Coze',
        'Codex',
        'DeepSeek',
      ],
    },
    {
      title: '创作软件',
      items: ['Photoshop', 'Premiere', 'After Effects', 'Audition', '剪映', 'Figma', 'Procreate'],
    },
    { title: '常用设备', items: ['索尼 A7M4', '佳能 R6', '大疆御 3', 'Pocket 3'] },
  ],
}

export const contact = {
  eyebrow: 'Follow',
  title: '新作品，在抖音更新',
  body: '新的 AI 玩法、踩过的坑、做出来的东西，都发在抖音。',
  openCta: '打开抖音主页',
}

/**
 * 所有用标题宋体（font-serif）显示的中文。`npm run fonts` 按这里的字生成字体子集，
 * 没收进来的字会退回系统字体，所以新增标题后记得重新生成。
 */
export const displayText = [
  home.title,
  ...home.entries.map((e) => e.title),
  '首页页面不存在',
  brand.cnName,
  brand.slogan,
  brand.account,
  brand.owner,
  ...nav.map((n) => n.label),
  ...stats.map((s) => s.unit),
  learn.title,
  learn.emptyTitle,
  works.title,
  works.film.title,
  works.visual.title,
  experience.title,
  experience.creator.title,
  ...experience.creator.stats.map((s) => s.unit),
  experience.sales.title,
  experience.growth.title,
  ...experience.growth.rows.map((r) => r.unit),
  experience.film.title,
  experience.film.work,
  frames.title,
  about.title,
  contact.title,
].join('')
