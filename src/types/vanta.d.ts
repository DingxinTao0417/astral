// Vanta.js 没有自带类型声明，这里只写用到的部分
declare module 'vanta/src/_shaderBase.js' {
  import type { Camera, Scene, WebGLRenderer } from 'three'

  export interface VantaOptions {
    el: HTMLElement
    /** three.js 的导出对象 */
    THREE?: object
    mouseControls?: boolean
    touchControls?: boolean
    gyroControls?: boolean
    /** 鼠标位置带缓动 */
    mouseEase?: boolean
    minHeight?: number
    minWidth?: number
    /** 画面分辨率 = 屏幕像素比 ÷ scale，数字越大越省显卡 */
    scale?: number
    scaleMobile?: number
    speed?: number
    backgroundColor?: number
    backgroundAlpha?: number
  }

  /** Vanta 里所有「一张全屏着色器」类效果的基类：负责画布、尺寸、鼠标、只在可见时渲染 */
  export default class ShaderBase {
    constructor(options: VantaOptions)
    el: HTMLElement
    options: VantaOptions
    renderer: WebGLRenderer | null
    scene: Scene | null
    camera: Camera
    uniforms: Record<string, { type?: string; value: unknown }>
    width: number
    height: number
    scale: number
    fragmentShader: string
    initBasicShader(fragmentShader?: string, vertexShader?: string): void
    /** 改参数。数字和颜色类的参数会同步成着色器里的同名 uniform */
    setOptions(options: object): void
    resize(): void
    destroy(): void
  }
}
