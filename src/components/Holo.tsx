import type { HTMLAttributes, PointerEvent } from 'react'
import { cx } from '../lib/cx'

interface HoloProps extends HTMLAttributes<HTMLSpanElement> {
  /** 最大倾斜角度 */
  tilt?: number
}

const VARS = ['--rx', '--ry', '--gx', '--gy']

/**
 * 镭射卡外框：渐变描边 + 一层会动的镭射反光。鼠标滑过时卡片 3D 倾斜，反光跟手。
 * 样式在 index.css 的 .holo，这里只负责把鼠标位置写成 CSS 变量。
 */
export function Holo({ tilt = 12, className, children, ...rest }: HoloProps) {
  const onPointerMove = (e: PointerEvent<HTMLSpanElement>) => {
    if (e.pointerType !== 'mouse') return
    const el = e.currentTarget
    const rect = el.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    el.style.setProperty('--rx', `${((0.5 - y) * tilt).toFixed(2)}deg`)
    el.style.setProperty('--ry', `${((x - 0.5) * tilt).toFixed(2)}deg`)
    el.style.setProperty('--gx', `${(x * 100).toFixed(1)}%`)
    el.style.setProperty('--gy', `${(y * 100).toFixed(1)}%`)
  }
  const onPointerLeave = (e: PointerEvent<HTMLSpanElement>) => {
    for (const name of VARS) e.currentTarget.style.removeProperty(name)
  }

  return (
    <span className={cx('holo', className)} onPointerMove={onPointerMove} onPointerLeave={onPointerLeave} {...rest}>
      {children}
    </span>
  )
}
