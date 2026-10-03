import { useEffect, useLayoutEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { Backdrop } from './components/Backdrop'
import { ClickSpark } from './components/bits/ClickSpark'
import { TargetCursor } from './components/bits/TargetCursor'
import { Contact } from './components/Contact'
import { LightboxProvider } from './components/Lightbox'
import { Preloader } from './components/motion/Preloader'
import { SmoothScroll } from './components/motion/SmoothScroll'
import { TransitionProvider } from './components/motion/Transition'
import { Nav } from './components/Nav'
import { ScrollTrigger } from './lib/gsap'
import { scroller } from './lib/scroll'
import { AboutPage } from './pages/AboutPage'
import { ExperiencePage } from './pages/ExperiencePage'
import { FramesPage } from './pages/FramesPage'
import { HomePage } from './pages/HomePage'
import { LearnPage } from './pages/LearnPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { WorksPage } from './pages/WorksPage'

export default function App() {
  return (
    <BrowserRouter>
      <SmoothScroll />
      <Preloader />
      <TransitionProvider>
        <LightboxProvider>
          <Backdrop />
          <Nav />
          <Pages />
          <Contact />
        </LightboxProvider>
      </TransitionProvider>
      <ClickSpark />
      <TargetCursor />
    </BrowserRouter>
  )
}

function Pages() {
  const { pathname } = useLocation()
  return (
    <>
      <ScrollReset />
      {/* key 跟着路径变，换页时整页重新挂载并淡入 */}
      <main key={pathname} className="animate-[fade-in_0.5s_ease-out]">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/ai" element={<LearnPage />} />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/experience" element={<ExperiencePage />} />
          <Route path="/frames" element={<FramesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
    </>
  )
}

/**
 * 换页后回到顶部。必须排在 <main> 前面：这样它会先于新页面的滚动动画执行，
 * 新页面量位置的时候页面已经在顶部了，不会把「上一页滚到哪」当成自己的进度。
 */
function ScrollReset() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    scroller.toTop()
  }, [pathname])

  // 新页面的高度和上一页不一样，让所有滚动动画重新量一遍
  useEffect(() => {
    ScrollTrigger.refresh()
  }, [pathname])

  // 标题字体加载完会把版面撑高一点，也要重新量
  useEffect(() => {
    history.scrollRestoration = 'manual'
    void document.fonts.ready.then(() => ScrollTrigger.refresh())
  }, [])

  return null
}
