import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router'
import { Backdrop } from './components/Backdrop'
import { Contact } from './components/Contact'
import { LightboxProvider } from './components/Lightbox'
import { Nav } from './components/Nav'
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
      <LightboxProvider>
        <Backdrop />
        <Nav />
        <Pages />
        <Contact />
      </LightboxProvider>
    </BrowserRouter>
  )
}

function Pages() {
  const { pathname } = useLocation()

  // 换页后回到顶部
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    // key 跟着路径变，换页时整页重新挂载并淡入
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
  )
}
