# Astral 新星实验室 · 个人品牌站

抖音号「Astral新星实验室」的个人品牌站，目的是品牌背书，不是求职。

技术栈：React 19 + TypeScript + Tailwind CSS 4 + Vite + React Router，部署到 Vercel。

一共六个页面：首页 `/`、AI 学习 `/ai`、作品 `/works`、经历 `/experience`、影像 `/frames`、关于 `/about`。

## 常用命令

```bash
npm run dev      # 本地预览，http://localhost:5173
npm run build    # 类型检查 + 打包到 dist/
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

改了**标题类文字**（板块标题、卡片标题等用宋体显示的字）后要运行 `npm run fonts`。
标题字体只打包了用到的字，新字不重新生成会退回系统字体。需要 Python 和 `pip install fonttools brotli`。

## 目录

```
src/
  content/site.ts      全站文案
  content/learn.ts     「AI」页的学习资料清单
  content/media.json   图片尺寸清单（npm run media 自动生成）
  pages/               六个页面 + 404
  components/          页面内容：Hero / Stats / Gateway / Learn / Works / Experience / Frames / About / Contact
  components/Aurora    页头的流动极光（WebGL）
  components/Holo      镭射卡外框（3D 倾斜 + 反光）
  components/works/    作品页用的交互组件：手机视频、前后对比滑块
  index.css            配色、字体、动画
public/media/          压缩后的上站图片和视频（由脚本生成）
scripts/               图片压缩、字体子集化脚本
assets/                原始素材，167MB，只留本地，不进 git
content/               从作品集整理的原始资料（Markdown）
```

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
