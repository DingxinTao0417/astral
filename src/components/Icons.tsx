import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

function Line({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  )
}

/** 四角星，品牌的主视觉符号 */
export function Sparkle(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M12 0C12.6 7.2 16.8 11.4 24 12C16.8 12.6 12.6 16.8 12 24C11.4 16.8 7.2 12.6 0 12C7.2 11.4 11.4 7.2 12 0Z" />
    </svg>
  )
}

export const ArrowUpRight = (p: IconProps) => (
  <Line {...p}>
    <path d="M7 17 17 7M8 7h9v9" />
  </Line>
)
export const ArrowDown = (p: IconProps) => (
  <Line {...p}>
    <path d="M12 5v14m-6-6 6 6 6-6" />
  </Line>
)
export const ArrowRight = (p: IconProps) => (
  <Line {...p}>
    <path d="M5 12h14m-6-6 6 6-6 6" />
  </Line>
)
export const ChevronLeft = (p: IconProps) => (
  <Line {...p}>
    <path d="m15 6-6 6 6 6" />
  </Line>
)
export const ChevronRight = (p: IconProps) => (
  <Line {...p}>
    <path d="m9 6 6 6-6 6" />
  </Line>
)
export const Close = (p: IconProps) => (
  <Line {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Line>
)
export const Menu = (p: IconProps) => (
  <Line {...p}>
    <path d="M4 8h16M4 16h16" />
  </Line>
)
export const Copy = (p: IconProps) => (
  <Line {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2.5" />
    <path d="M5 15V7a3 3 0 0 1 3-3h7" />
  </Line>
)
export const Check = (p: IconProps) => (
  <Line {...p}>
    <path d="m5 12 5 5L19 7" />
  </Line>
)
export const Expand = (p: IconProps) => (
  <Line {...p}>
    <path d="M9 4H4v5m11-5h5v5M9 20H4v-5m11 5h5v-5" />
  </Line>
)
export const Drag = (p: IconProps) => (
  <Line {...p}>
    <path d="m9 7-5 5 5 5m6-10 5 5-5 5" />
  </Line>
)
export function Play(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M8 5v14a1 1 0 0 0 1.5.9l11-7a1 1 0 0 0 0-1.8l-11-7A1 1 0 0 0 8 5Z" />
    </svg>
  )
}
