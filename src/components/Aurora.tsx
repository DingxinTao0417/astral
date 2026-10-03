import { useEffect, useRef } from 'react'
import { cx } from '../lib/cx'
import { prefersReducedMotion } from '../lib/hooks'

const VERTEX = 'attribute vec2 a; void main() { gl_Position = vec4(a, 0.0, 1.0); }'

// 用噪声把坐标「揉」一下再上色，得到像丝绸一样缓慢流动的粉紫极光
const FRAGMENT = `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 uRes;
uniform float uTime;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x * 34.0) + 1.0) * x); }

// 2D simplex noise（Ian McEwan / Ashima Arts，MIT）
float snoise(vec2 v) {
  const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
  vec2 i = floor(v + dot(v, C.yy));
  vec2 x0 = v - i + dot(i, C.xx);
  vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
  vec4 x12 = x0.xyxy + C.xxzz;
  x12.xy -= i1;
  i = mod289(i);
  vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
  vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
  m = m * m;
  m = m * m;
  vec3 x = 2.0 * fract(p * C.www) - 1.0;
  vec3 h = abs(x) - 0.5;
  vec3 ox = floor(x + 0.5);
  vec3 a0 = x - ox;
  m *= 1.79284291400159 - 0.85373472095314 * (a0 * a0 + h * h);
  vec3 g;
  g.x = a0.x * x0.x + h.x * x0.y;
  g.yz = a0.yz * x12.xz + h.yz * x12.yw;
  return 130.0 * dot(m, g);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2(uv.x * uRes.x / uRes.y, uv.y);
  float t = uTime * 0.04;

  vec2 w = p * 0.7;
  vec2 q = p + 0.45 * vec2(snoise(w + vec2(t, -t * 0.7)), snoise(w + vec2(-t * 0.8, t) + 13.7));
  float a = snoise(q * 0.8 + vec2(t * 0.6, 0.0));
  float b = snoise(q * 1.45 + vec2(4.0, -t * 0.9));
  float ribbon = sin((q.y * 2.4 + a * 1.5 + t * 2.0) * 3.14159) * 0.5 + 0.5;

  vec3 night  = vec3(0.047, 0.016, 0.137);
  vec3 indigo = vec3(0.170, 0.050, 0.360);
  vec3 violet = vec3(0.520, 0.220, 0.840);
  vec3 orchid = vec3(0.820, 0.340, 0.920);
  vec3 pink   = vec3(1.000, 0.400, 0.720);
  vec3 peach  = vec3(1.000, 0.770, 0.680);

  // 越靠下越亮：上方留给导航和标题，下方是极光最浓的地方
  float low = smoothstep(1.05, 0.0, uv.y);

  vec3 col = mix(night, indigo, smoothstep(-0.8, 0.5, a));
  col = mix(col, violet, smoothstep(-0.2, 0.85, a) * (0.26 + 0.5 * low));
  col = mix(col, orchid, smoothstep(-0.1, 0.9, b) * (0.16 + 0.62 * low));
  col = mix(col, pink, smoothstep(0.15, 0.95, ribbon) * smoothstep(-0.4, 0.7, b) * (0.16 + 0.8 * low));
  col = mix(col, peach, smoothstep(0.5, 1.0, a * 0.5 + b * 0.5 + 0.3) * 0.38 * low);

  col *= mix(0.6, 1.0, smoothstep(1.0, 0.5, uv.y));
  float vignette = smoothstep(1.3, 0.3, length((uv - vec2(0.5, 0.4)) * vec2(1.0, 1.1)));
  col *= mix(0.7, 1.0, vignette);

  float grain = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
  col += (grain - 0.5) * 0.03;

  gl_FragColor = vec4(col, 1.0);
}
`

/**
 * 首屏的流动极光。画在低分辨率的 canvas 上再放大（本来就是柔和的渐变，看不出差别），
 * 滚出屏幕或切到后台时自动暂停。浏览器不支持 WebGL 时露出 .hero-sky 的静态渐变。
 */
export function Aurora({ className }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const gl = canvas.getContext('webgl', {
      alpha: false,
      antialias: false,
      depth: false,
      stencil: false,
      powerPreference: 'low-power',
    })
    if (!gl) return

    const compile = (type: number, source: string) => {
      const shader = gl.createShader(type)!
      gl.shaderSource(shader, source)
      gl.compileShader(shader)
      return shader
    }
    const program = gl.createProgram()!
    gl.attachShader(program, compile(gl.VERTEX_SHADER, VERTEX))
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAGMENT))
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return
    gl.useProgram(program)

    // 一个盖住整个画布的大三角形
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const position = gl.getAttribLocation(program, 'a')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(program, 'uRes')
    const uTime = gl.getUniformLocation(program, 'uTime')

    const start = performance.now()
    const draw = (now: number) => {
      gl.uniform1f(uTime, (now - start) / 1000 + 24)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    const resize = () => {
      const scale = Math.min(0.6, 760 / Math.max(canvas.clientWidth, 1))
      canvas.width = Math.max(2, Math.round(canvas.clientWidth * scale))
      canvas.height = Math.max(2, Math.round(canvas.clientHeight * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      draw(performance.now())
    }

    const still = prefersReducedMotion()
    let frame = 0
    let last = 0
    let onScreen = false
    const loop = (now: number) => {
      frame = requestAnimationFrame(loop)
      if (now - last < 32) return // 约 30 帧，够用了
      last = now
      draw(now)
    }
    const sync = () => {
      cancelAnimationFrame(frame)
      if (onScreen && !document.hidden && !still) frame = requestAnimationFrame(loop)
    }

    resize()
    canvas.dataset.ready = 'true'

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting
      sync()
    })
    visibility.observe(canvas)
    const resizer = new ResizeObserver(resize)
    resizer.observe(canvas)
    document.addEventListener('visibilitychange', sync)

    return () => {
      cancelAnimationFrame(frame)
      visibility.disconnect()
      resizer.disconnect()
      document.removeEventListener('visibilitychange', sync)
      // 主动把显卡资源还回去。每个页面的页头都有一张极光，来回切页面不归还的话，
      // 攒到十几张浏览器就会强行回收最早的那张并报警告。
      // 稍等一下再确认画布真的被移出页面了才归还：本地预览时 React 会故意把每个组件「卸载再装回」一次，
      // 那种情况下画布还在页面上，不能动它
      window.setTimeout(() => {
        if (!canvas.isConnected) gl.getExtension('WEBGL_lose_context')?.loseContext()
      }, 0)
    }
  }, [])

  return (
    <div aria-hidden="true" className={cx('hero-sky', className)}>
      <canvas
        ref={ref}
        className="size-full opacity-0 transition-opacity duration-1000 data-[ready=true]:opacity-100"
      />
    </div>
  )
}
