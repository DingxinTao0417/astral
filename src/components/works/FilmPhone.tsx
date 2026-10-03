import { useRef, useState } from 'react'
import { DESKTOP, gsap, useGSAP } from '../../lib/gsap'
import { Play } from '../Icons'

interface FilmPhoneProps {
  src: string
  poster: string
  caption: string
}

/** 手机框里的竖版视频。点击才加载，省流量。桌面端滚动经过时，手机会跟着缓缓转过一个角度 */
export function FilmPhone({ src, poster, caption }: FilmPhoneProps) {
  const root = useRef<HTMLElement>(null)
  const video = useRef<HTMLVideoElement>(null)
  const [started, setStarted] = useState(false)

  const start = () => {
    setStarted(true)
    void video.current?.play()
  }

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(DESKTOP, () => {
        gsap.fromTo(
          '[data-phone]',
          { rotateY: 18, rotateX: 6, yPercent: 7 },
          {
            rotateY: -12,
            rotateX: -4,
            yPercent: -7,
            ease: 'none',
            scrollTrigger: { trigger: root.current, start: 'top bottom', end: 'bottom top', scrub: 0.6 },
          },
        )
      })
      return () => mm.revert()
    },
    { scope: root },
  )

  return (
    <figure ref={root} className="mx-auto w-[min(72vw,290px)] [perspective:1100px]">
      <div
        data-phone
        className="relative rounded-[2.7rem] border border-white/15 bg-night-950 p-2.5 shadow-[0_50px_120px_-40px_rgb(155_107_255/0.8),inset_0_1px_0_rgb(255_255_255/0.14)]"
      >
        <div className="relative aspect-9/16 overflow-hidden rounded-[2.1rem] bg-black">
          <video
            ref={video}
            src={src}
            poster={poster}
            playsInline
            preload="none"
            controls={started}
            className="size-full object-cover"
          />
          {!started && (
            <button
              type="button"
              aria-label={`播放：${caption}`}
              data-cursor="播放"
              className="group absolute inset-0 grid place-items-center bg-linear-to-t from-black/45 via-transparent to-black/10"
              onClick={start}
            >
              <span className="relative grid size-18 place-items-center rounded-full border border-white/35 bg-white/15 backdrop-blur-md transition-transform duration-500 ease-soft group-hover:scale-110">
                <span className="absolute inset-0 animate-[ping-soft_2.4s_ease-out_infinite] rounded-full border border-white/50" />
                <Play className="ml-1 size-7 text-white" />
              </span>
            </button>
          )}
        </div>
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-5 h-5 w-20 -translate-x-1/2 rounded-full bg-black"
        />
      </div>
      <figcaption className="mt-5 text-center text-xs tracking-[0.08em] text-mist-400">{caption}</figcaption>
    </figure>
  )
}
