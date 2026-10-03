/**
 * Vanta 的着色器基类只用到 three.js 里的这几样东西。
 * 单独列出来再整体传给 Vanta，打包时就不会把整个 three.js 都带上。
 */
export { Camera, Color, Mesh, PlaneGeometry, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer } from 'three'
