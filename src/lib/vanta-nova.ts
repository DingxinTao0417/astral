import { LinearFilter, WebGLRenderTarget } from 'three'
import ShaderBase, { type VantaOptions } from 'vanta/src/_shaderBase.js'
import * as THREE from './three-lite'

/**
 * 「新星光环」：在 Vanta.js 的 HALO 效果基础上改的定制版。
 *
 * 保留了 HALO 的做法：每一帧把上一帧的画面稍微往外推、再淡一点，叠上新画的光环，
 * 于是光环会拖出一圈缓慢外扩的日冕。改掉的是上色：原版颜色是全彩虹循环，而且辉光会累积成一片白，
 * 这里把颜色锁在粉 → 紫 → 一点暖桃色，亮度封顶，不会盖住前面的标题。
 */
const FRAGMENT = `
uniform vec2 iResolution;
uniform float iDpr;
uniform vec2 iMouse;
uniform float iTime;
uniform sampler2D iBuffer;

uniform float xOffset;
uniform float yOffset;
uniform float size;
uniform float amplitudeFactor;
uniform float glow;
uniform float trail;
uniform float sharpness;
uniform float mouseShift;
uniform float pull;
uniform float hotAngle;
uniform vec3 colorA;
uniform vec3 colorB;
uniform vec3 colorC;

void main() {
  vec2 res = iResolution.xy * iDpr;
  vec2 uv = gl_FragCoord.xy / res;

  // 以光环中心为原点、以画面高度为单位的坐标
  vec2 p = (gl_FragCoord.xy - 0.5 * res) / res.y;
  p.x -= xOffset * res.x / res.y;
  p.y -= yOffset;
  vec2 mouse = (iMouse * iDpr / res - 0.5) * vec2(1.0, -1.0);
  // 鼠标相对光环中心的位置
  vec2 toMouse = vec2(mouse.x * res.x / res.y - xOffset * res.x / res.y, mouse.y - yOffset);
  p -= mouse * mouseShift;

  // ── 上一帧：一份跟着自己的颜色漂移（像等离子一样卷曲），一份从圆心往外推 ──
  vec2 center = vec2(0.5 + xOffset, 0.5 + yOffset);
  vec3 last = texture2D(iBuffer, uv).rgb;
  vec2 curl = uv + vec2(last.g - 0.18, last.r - 0.3) * 0.006;
  float orbit = mod(iTime * 0.6, 6.2832);
  vec2 push = (uv - center) * 0.9962 + center + vec2(cos(orbit), sin(orbit)) * 0.0008;
  vec3 corona = texture2D(iBuffer, curl).rgb * 0.42 + texture2D(iBuffer, push).rgb * 0.58;
  corona = max(corona - 0.0025, 0.0) * trail;

  // ── 这一帧的光环：一圈带轻微起伏的细环 ──
  float angle = atan(p.x, p.y);
  float wobble =
    sin(angle * 5.0 + iTime * 0.45) * sin(iTime * 0.8) * 0.045 +
    sin(angle * 3.0 - iTime * 0.3) * 0.03;

  // 朝着鼠标的那一段光环会被「引」过去一点、亮一点；鼠标离圆心越远越明显
  float away = angle - atan(toMouse.x, toMouse.y);
  away = atan(sin(away), cos(away));
  float reach = exp(-away * away * 2.6) * smoothstep(0.02, 0.3, length(toMouse)) * pull;

  float edge = abs((length(p) * 8.0 * (1.0 - 0.06 * reach) + wobble * amplitudeFactor * size) * 0.65 / size);
  float ring = smoothstep(1.0, 1.0 - 0.1 / sharpness, edge) * pow(edge, 20.0 * sharpness);

  // 标题右上角那颗星所在的方向：光环在这里最亮，像日全食的「钻石环」
  float toStar = angle - hotAngle;
  toStar = atan(sin(toStar), cos(toStar));
  float diamond = exp(-toStar * toStar * 16.0) * (0.8 + 0.2 * sin(iTime * 1.3));

  // 颜色沿着圆周从粉过渡到紫，缓慢旋转；最亮的地方带一点暖桃色
  float sweep = 0.5 + 0.5 * sin(angle + iTime * 0.25);
  vec3 tint = mix(colorA, colorB, sweep);
  tint = mix(tint, colorC, clamp(diamond * 0.8 + reach * 0.35, 0.0, 1.0));
  ring *= 1.0 + diamond * 1.4 + reach * 0.6;

  // 取较亮者而不是相加：环心不会越叠越白
  vec3 color = max(corona, tint * min(ring * glow, 1.0));
  gl_FragColor = vec4(color, 1.0);
}
`

export interface NovaOptions extends VantaOptions {
  /** 光环中心相对画面中心的偏移：x 以画面宽度为单位，y 以高度为单位（向上为正） */
  xOffset?: number
  yOffset?: number
  /** 光环半径 ≈ size × 0.18 × 画面高度 */
  size?: number
  /** 环的起伏幅度 */
  amplitudeFactor?: number
  /** 环本身的亮度 */
  glow?: number
  /** 日冕每帧保留多少，越接近 1 拖得越长 */
  trail?: number
  /** 环的锐利程度，越大越细 */
  sharpness?: number
  /** 光环整体跟随鼠标平移的幅度，以画面高度为 1 */
  mouseShift?: number
  /** 光环朝鼠标方向鼓起、变亮的程度，0 表示不响应 */
  pull?: number
  /** 光环上最亮那一点的方向：从正上方起顺时针，弧度 */
  hotAngle?: number
  colorA?: number
  colorB?: number
  colorC?: number
}

export class Nova extends ShaderBase {
  // 这两个缓冲在父类构造函数里（onInit）就创建了，用 declare 避免被子类的字段初始化覆盖
  private declare front: WebGLRenderTarget | null
  private declare back: WebGLRenderTarget | null

  constructor(options: NovaOptions) {
    super({ ...options, THREE })
  }

  setOptions(options: Partial<NovaOptions>) {
    super.setOptions(options)
  }

  getDefaultOptions(): Partial<NovaOptions> {
    return {
      backgroundColor: 0x000000,
      xOffset: 0,
      yOffset: 0,
      size: 2.4,
      amplitudeFactor: 0.5,
      glow: 6,
      trail: 0.972,
      sharpness: 1.6,
      mouseShift: 0.03,
      pull: 1,
      hotAngle: 0.8,
      colorA: 0xff4fa8,
      colorB: 0x8a5cff,
      colorC: 0xffc4ad,
      mouseEase: true,
      speed: 1,
    }
  }

  private bufferSize() {
    const ratio = window.devicePixelRatio / this.scale
    return [Math.max(2, Math.round(this.width * ratio)), Math.max(2, Math.round(this.height * ratio))] as const
  }

  onInit() {
    const [w, h] = this.bufferSize()
    const filters = { minFilter: LinearFilter, magFilter: LinearFilter, depthBuffer: false }
    this.front = new WebGLRenderTarget(w, h, filters)
    this.back = new WebGLRenderTarget(w, h, filters)
  }

  initBasicShader(fragmentShader?: string, vertexShader?: string) {
    super.initBasicShader(fragmentShader, vertexShader)
    this.uniforms.iBuffer = { type: 't', value: this.back?.texture }
  }

  /** 每帧先把画面画进缓冲，下一帧再读它（两张缓冲来回换，着色器不能读写同一张） */
  onUpdate() {
    const { renderer, scene, front, back } = this
    if (!renderer || !scene || !front || !back) return
    this.uniforms.iBuffer.value = back.texture
    renderer.setRenderTarget(front)
    renderer.render(scene, this.camera)
    renderer.setRenderTarget(null)
    renderer.clear()
    this.front = back
    this.back = front
  }

  onResize() {
    if (!this.front || !this.back) return
    const [w, h] = this.bufferSize()
    this.front.setSize(w, h)
    this.back.setSize(w, h)
  }

  /** Vanta 自己的 destroy 不归还显卡资源，来回切几次页面浏览器就会报 WebGL 上下文过多，这里补上 */
  dispose() {
    const { renderer } = this
    this.front?.dispose()
    this.back?.dispose()
    this.front = this.back = null
    this.destroy()
    renderer?.dispose()
    renderer?.forceContextLoss()
  }
}

Nova.prototype.fragmentShader = FRAGMENT
