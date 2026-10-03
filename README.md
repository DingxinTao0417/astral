# Astral 新星实验室 · 个人品牌站

抖音号「Astral新星实验室」的个人品牌站，目的是品牌背书，不是求职。

技术栈：React 19 + TypeScript + Tailwind CSS 4 + Vite + React Router，部署到 Vercel。
动效用了四样东西：GSAP（所有进场、滚动、转场动画）、Lenis（带惯性的平滑滚动）、Vanta.js（首屏的光环）、
React Bits（几个现成的动效组件，改过之后放在 `src/components/bits/`）。详见下面的「动效说明」。

一共六个页面：首页 `/`、AI 学习 `/ai`、作品 `/works`、经历 `/experience`、影像 `/frames`、关于 `/about`。

## 常用命令

```bash
npm run dev      # 本地预览，http://localhost:5173
npm run build    # 类型检查 + 打包到 dist/
npm run preview  # 在本地看打包后的成品（先运行 build），http://localhost:4173
npm run media    # 重新压缩图片（改了 assets/ 或图片清单后运行）
npm run fonts    # 重新生成标题字体（改了标题文字后运行）
```

## 想改东西，去哪里改

| 想改什么 | 改哪里 |
| --- | --- |
| **往「AI」页加学习资料** | [src/content/learn.ts](src/content/learn.ts)，在 `learnItems` 里加一条，文件里有示例和每个字段的说明 |
| 任何文字、链接、数据 | [src/content/site.ts](src/content/site.ts)，除学习资料外的文案都在这一个文件 |
| 抖音主页链接 | `site.ts` 里的 `brand.douyinUrl` |
| logo / 头像 | 换掉 `assets/brand/douyin-avatar.jpg` 后告诉 Claude 重新生成 `public/media/avatar.webp` 和图标 |
| 影像作品的顺序、分类、说明 | `site.ts` 里的 `frames.items` |
| 增删图片 | 原图放进 `assets/` → 在 [scripts/build-media.mjs](scripts/build-media.mjs) 登记 → `npm run media` → 在 `site.ts` 里引用 id |
| 颜色、字体 | [src/index.css](src/index.css) 顶部的 `@theme` |
| 首页入口卡片的文字 | `site.ts` 里的 `home.entries` |
| 某个页面的版式 | `src/pages/` 是每一页的骨架，具体内容在 `src/components/` 下同名文件 |
| 鼠标移到图片上时光标旁的小字（查看 / 拖动 / 播放） | 对应元素上的 `data-cursor="…"`，全站搜这个词就能找到 |
| 动效太多 / 太少、想关掉某一个 | 见下面「动效说明」里每一项的「怎么关」 |

改了**标题类文字**（板块标题、卡片标题等用宋体显示的字）后要运行 `npm run fonts`。
标题字体只打包了用到的字，新字不重新生成会退回系统字体。需要 Python 和 `pip install fonttools brotli`。

## 目录

```
src/
  content/site.ts      全站文案
  content/learn.ts     「AI」页的学习资料清单
  content/media.json   图片尺寸清单（npm run media 自动生成）
  pages/               六个页面 + 404
  components/          页面内容：Hero / Manifesto / Stats / Gateway / Learn / Works / Experience / Frames / About / Contact
  components/Aurora    页头的流动极光（WebGL）
  components/Holo      镭射卡外框（3D 倾斜 + 反光）
  components/works/    作品页用的交互组件：手机视频、前后对比滑块
  components/motion/   动效的「基础设施」：平滑滚动、开场加载页、转场幕布、首屏光环、数字滚轮、滚动字幕
  components/bits/     从 React Bits 拿来改过的组件：取景框光标、点击火花、磁吸按钮、标题逐字进场、
                       逐词阅读、图片拖尾、瀑布流
  lib/gsap.ts          GSAP 的统一入口：插件注册、全站三条缓动曲线、「桌面端」的判断条件
  lib/vanta-nova.ts    首屏光环的着色器（基于 Vanta.js 的 HALO 改的）
  lib/stage.ts         「幕布拉开了没有」：进场动画都等它
  lib/scroll.ts        平滑滚动的开关：锁滚动、回顶部
  index.css            配色、字体、少量 CSS 动画
public/media/          压缩后的上站图片和视频（由脚本生成）
scripts/               图片压缩、字体子集化脚本
assets/                原始素材，167MB，只留本地，不进 git
content/               从作品集整理的原始资料（Markdown）
```

## 动效说明

每一项都写了它在哪个文件、想关掉怎么关。**手机上**没有光标、光环、钉住滚动和横向画廊这几样（费电，而且没有鼠标也用不上），
其余都有。访客的系统如果开了「减弱动态效果」，所有动画都会停用，直接显示最终的样子。

| 效果 | 在哪 | 用的什么 | 怎么关 |
| --- | --- | --- | --- |
| 平滑滚动（滚轮带惯性） | `components/motion/SmoothScroll.tsx` | Lenis | 在 `App.tsx` 里删掉 `<SmoothScroll />` |
| 开场加载页（星星 + 数字跑到 100 + 幕布上拉） | `index.html` 里的 `#boot` + `components/motion/Preloader.tsx` | GSAP | 删掉 `index.html` 里的 `<div id="boot">` 整块 |
| 换页时的五块幕布 | `components/motion/Transition.tsx` | GSAP | 把各处的 `TLink` 换回 react-router 的 `Link` |
| 取景框光标 | `components/bits/TargetCursor.tsx` | React Bits + GSAP | 在 `App.tsx` 里删掉 `<TargetCursor />`，系统光标会自动回来 |
| 点击火花 | `components/bits/ClickSpark.tsx` | React Bits | 在 `App.tsx` 里删掉 `<ClickSpark />` |
| 按钮被鼠标「吸」过去 | `components/bits/Magnet.tsx` | React Bits + GSAP | 去掉按钮外面那层 `<Magnet>` |
| 首屏光环（穿过标题右上角的星） | `components/motion/VantaNova.tsx` + `lib/vanta-nova.ts` | Vanta.js + three.js | 在 `Hero.tsx` 里删掉 `<VantaNova … />` 那一行，下面的极光还在 |
| 首屏标题逐字母升起、鼠标视差、滚动时卡组展开 | `components/Hero.tsx` | GSAP SplitText + ScrollTrigger | — |
| 标语「对焦 → 解码」 | `components/Manifesto.tsx` | GSAP ScrollTrigger | 在 `pages/HomePage.tsx` 里删掉 `<Manifesto />` |
| 数字像里程表一样滚出来 | `components/motion/Odometer.tsx` | GSAP | — |
| 首页横向画廊（桌面端） | `components/Gateway.tsx` | GSAP ScrollTrigger | 把文件里的 `mm.add(DESKTOP, …)` 整段删掉，并把样式里的 `desk:` 去掉 |
| 页脚的巨型品牌字幕、首屏工具条 | `components/motion/VelocityMarquee.tsx` | 思路来自 React Bits，用 GSAP 重写 | — |
| 标题逐字进场 | `components/bits/SplitText.tsx` | React Bits + GSAP SplitText | 把 `<SplitText>` 换回普通的 `<h2>` |
| 「关于」页的自述逐词变清楚 | `components/bits/ScrollReveal.tsx` | React Bits + GSAP | 把 `<ScrollReveal>` 换回 `<p>` |
| 「影像」页头跟着鼠标出现的照片 | `components/bits/ImageTrail.tsx` | React Bits + GSAP | 在 `pages/FramesPage.tsx` 里删掉 `<ImageTrail … />` |
| 「影像」页换分类时照片滑到新位置 | `components/bits/Masonry.tsx` | React Bits + GSAP | — |
| 大图从缩略图的位置放大出来 | `components/Lightbox.tsx` | GSAP | — |
| 「作品」页的前后对比跟着滚动自己擦开 | `components/works/CompareSlider.tsx` | GSAP ScrollTrigger | — |

几个调参数的地方：

- **光环的颜色、粗细、拖尾长短**：`src/lib/vanta-nova.ts` 里 `getDefaultOptions`，每个参数旁边有说明。
- **全站动画的「手感」**：`src/lib/gsap.ts` 里的三条缓动曲线（silk / soft / curtain）。
- **光环会自己量帧率**：电脑显卡吃力的话先自动降画质，还不行就关掉、只留极光，不用手动管。
- React Bits 的组件是把源码拷进项目再改的（不是装的包），所以以后想改哪里直接改 `src/components/bits/` 下的文件。
  每个文件开头都写了它来自哪个组件、改了什么。React Bits 的授权是 MIT + Commons Clause：自己的网站随便用，不能把这些组件单独拿去卖。

## 部署到 Vercel

1. 把项目推到 GitHub（`assets/` 已在 `.gitignore` 里，不会上传）。
2. 在 Vercel 导入这个仓库，框架会自动识别为 Vite，不用改任何设置。
   根目录的 `vercel.json` 负责让 `/ai` 这类子页面地址刷新后也能打开，不要删。
3. **绑定自己的域名**。`*.vercel.app` 在国内访问不稳定，抖音来的访客大概率打不开，绑了自定义域名才正常。

## 原始资料

内容来源是《星辉个人作品集 -2026》（21 页），飞书原文
https://nrqpwy4w6x.feishu.cn/wiki/FOGswDPOaiQPVmkDHCFcthgOnaf 。
文字和图片于 2026-10-03 提取完毕，原 PPT 已移入回收站。

| 路径 | 内容 |
| --- | --- |
| [content/site-copy.md](content/site-copy.md) | 取舍思路：哪些内容上站、哪些删掉、为什么 |
| [content/profile.md](content/profile.md) | 个人信息、时间线、技能、设备 |
| [content/experience.md](content/experience.md) | 工作经历全文 |
| [content/projects.md](content/projects.md) | 项目作品全文 |
| [content/photography.md](content/photography.md) | 摄影作品逐张清单 |
| [content/links.md](content/links.md) | 外部链接与账号数据 |

`assets/` 里文件名 `pNN-MM` = PPT 第 NN 页的第 MM 个素材。

## 待补充

- [ ] 「AI」页还没有正式资料。正式网站上现在显示的是「资料正在整理中」；本地预览看到的三张卡片是示例。
- [ ] 抖音号本身的数据或代表作。账号是新号（2026-10-03 查看时还没有发布作品），等有了内容再补到站上。
- [ ] 自定义域名。
- [ ] 文案是按作品集整理的草稿，语气请按自己的口吻过一遍，尤其是首屏和「关于我」。
- [ ] 低分辨率的照片换原片：`aerial-4`（广州塔夜景，只有 619px 宽）、`product-2/3/4`、`portrait-2/4`。
- [ ] 分享卡片用的封面图（og:image）还没做。

## 没有上站的素材

下面这些留在 `assets/` 里，没有放到网站上：

- AI 修图 PS 插件的全部内容（界面截图、介绍、4000+ 用户数），按本人要求整块撤下。
- 前公司的后台数据截图（Ins / Meta 广告后台、商品后台、众筹金额）。
- 银幸的短视频封面（有长者正脸）和视频号主页截图（有电话）。
- 插件需求文档、分镜脚本表等内部文档截图。
- 众筹产品宣发视频（54MB，团队合拍的实拍片，和 AI 主题关系不大）。
- 同人衍生品的图片（画作版权属于画师和 IP 方），站上只在「关于我」里提了一句。
