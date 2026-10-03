import { useMemo } from 'react'
import { cx } from '../lib/cx'

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  duration: number
  delay: number
}

// 固定种子的伪随机，保证每次刷新星星位置不变
function seeded(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function makeStars(count: number, seed: number): Star[] {
  const rand = seeded(seed)
  return Array.from({ length: count }, () => ({
    x: rand() * 100,
    y: rand() * 100,
    size: rand() < 0.86 ? 1 + rand() : 2 + rand() * 1.2,
    opacity: 0.3 + rand() * 0.65,
    duration: 3 + rand() * 5,
    delay: -rand() * 8,
  }))
}

/** 一片星点。只让三分之一的星星闪，其余静止，省电也更耐看 */
export function Stars({ count, seed = 20261003, className }: { count: number; seed?: number; className?: string }) {
  const stars = useMemo(() => makeStars(count, seed), [count, seed])
  return (
    <div aria-hidden="true" className={cx('pointer-events-none', className)}>
      {stars.map((s, i) => (
        <span
          key={i}
          className="absolute rounded-full bg-white"
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.size,
            height: s.size,
            opacity: s.opacity,
            animation: i % 3 === 0 ? `twinkle ${s.duration}s ease-in-out ${s.delay}s infinite` : undefined,
          }}
        />
      ))}
    </div>
  )
}

/** 全站固定背景：夜空渐变、缓慢漂移的粉紫光团、星点、噪点 */
export function Backdrop() {
  return (
    <div aria-hidden="true" className="sky pointer-events-none fixed inset-x-0 top-0 -z-10 h-lvh overflow-hidden">
      <div className="aurora aurora-a" />
      <div className="aurora aurora-b" />
      <div className="aurora aurora-c" />
      <Stars count={80} className="absolute inset-0" />
      <div className="grain absolute inset-0" />
    </div>
  )
}
