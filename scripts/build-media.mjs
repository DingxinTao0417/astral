// 把 assets/ 里的原始素材压缩成上站用的 WebP，输出到 public/media/，
// 并生成 src/content/media.json（尺寸、主色，用于占位和防止布局抖动）。
// 用法：npm run media
import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SRC = path.join(root, 'assets')
const OUT = path.join(root, 'public', 'media')

const PHOTO = { lg: 1600, sm: 720, quality: 80 }
const UI = { lg: 1200, sm: 600, quality: 90 }

/** [id, 原始文件, 选项] —— crop 用于把 PPT 里的拼图切回单张 */
const jobs = [
  // 影像作品 · 人像
  ['portrait-1', 'photography/portrait/p19-01.jpg'],
  ['portrait-2', 'photography/portrait/p19-02.png'],
  ['portrait-3', 'photography/portrait/p19-03.png'],
  ['portrait-4', 'photography/portrait/p19-04.png'],
  // 影像作品 · 产品
  ['product-1', 'photography/product/p16-01.jpg'],
  ['product-2', 'photography/product/p16-02.png'],
  ['product-3', 'photography/product/p16-03.jpg'],
  ['product-4', 'photography/product/p16-04.jpg'],
  ['product-5', 'photography/product/p16-05.png'],
  ['product-6', 'photography/product/p17-01.png', { crop: [4, 4, 848, 541] }],
  ['product-7', 'photography/product/p17-01.png', { crop: [4, 553, 848, 739] }],
  ['product-8', 'photography/product/p17-01.png', { crop: [1734, 4, 838, 1288] }],
  // 影像作品 · 美食
  ['food-1', 'photography/food/p18-01.png', { crop: [8, 8, 990, 658] }],
  ['food-2', 'photography/food/p18-01.png', { crop: [8, 676, 990, 656] }],
  ['food-3', 'photography/food/p18-01.png', { crop: [1007, 8, 877, 1322] }],
  ['food-4', 'photography/food/p18-01.png', { crop: [1896, 403, 671, 929] }],
  // 影像作品 · 航拍
  ['aerial-1', 'photography/aerial/p20-01.png'],
  ['aerial-2', 'photography/aerial/p20-02.jpg'],
  ['aerial-3', 'photography/aerial/p20-03.jpg'],
  ['aerial-4', 'photography/aerial/p20-04.png'],
  // 作品页 · AIGC 视频
  // 视频本身（public/media/aigc-film.mp4）是用 ffmpeg 从 p12-01.mp4 压到 540×960 的；
  // 封面是视频第 25 秒的一帧
  ['aigc-film-poster', 'projects/aigc/p12-01-frame.png'],
  ['aigc-character', 'projects/aigc/p12-02.png', { ui: true }],
  ['aigc-storyboard', 'projects/aigc/p12-03.png', { ui: true }],
  ['aigc-product', 'projects/aigc/p12-06.png', { ui: true }],
  // 作品页 · 白底图 → 成品
  ['white-clip', 'work/openmoon/p06-08.png'],
  ['banner-clip', 'work/openmoon/p06-07.png'],
  ['white-box', 'work/openmoon/p06-09.png'],
  ['banner-box', 'work/openmoon/p06-06.png'],
  ['selling-1', 'work/openmoon/p05-04.png', { crop: [16, 14, 896, 518] }],
  ['selling-2', 'work/openmoon/p05-04.png', { crop: [16, 615, 896, 529] }],
]

const hex = ({ r, g, b }) =>
  '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('')

await mkdir(OUT, { recursive: true })
const manifest = {}
let total = 0

for (const [id, file, opt = {}] of jobs) {
  const preset = opt.ui ? UI : PHOTO
  let img = sharp(path.join(SRC, file)).rotate()
  if (opt.crop) {
    const [left, top, width, height] = opt.crop
    img = img.extract({ left, top, width, height })
  }
  const base = await img.flatten({ background: '#ffffff' }).toBuffer()

  const entry = { src: `/media/${id}.webp`, sm: `/media/${id}-sm.webp` }
  for (const [key, size] of [['lg', preset.lg], ['sm', preset.sm]]) {
    const { data, info } = await sharp(base)
      .resize({ width: size, height: size, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: preset.quality, effort: 6 })
      .toBuffer({ resolveWithObject: true })
    await writeFile(path.join(OUT, key === 'lg' ? `${id}.webp` : `${id}-sm.webp`), data)
    total += data.length
    if (key === 'lg') Object.assign(entry, { w: info.width, h: info.height })
    else entry.smW = info.width
  }
  entry.color = hex((await sharp(base).stats()).dominant)
  manifest[id] = entry
  console.log(id.padEnd(18), `${entry.w}x${entry.h}`.padEnd(11), entry.color)
}

await writeFile(
  path.join(root, 'src', 'content', 'media.json'),
  JSON.stringify(manifest, null, 2) + '\n',
)
console.log(`\n${jobs.length} 张图，共 ${(total / 1024 / 1024).toFixed(1)} MB → public/media/`)
