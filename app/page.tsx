import ThemeController from './components/ThemeController'
import SmoothScroll from './components/SmoothScroll'
import Cursor from './components/Cursor'
import Boot from './components/Boot'
import Terminal from './components/Terminal'
import CommandPalette from './components/CommandPalette'
import OpsBar from './components/OpsBar'
import Toasts from './components/Toasts'
import Arcade from './components/Arcade'
import Incident from './components/Incident'
import Desktop from './components/Desktop'
import EasterEggs from './components/EasterEggs'
import Hero from './components/Hero'
import Experience from './components/Experience'
import Projects from './components/Projects'
import EarlyWork from './components/EarlyWork'
import ControlRoom from './components/ControlRoom'
import Writing from './components/Writing'
import Approach from './components/Approach'
import Contact from './components/Contact'

export default function Home() {
  return (
    <>
      {/* fixed background stack — the blended ground plus the colour bloom */}
      <div className="bg-stack" aria-hidden="true">
        <div className="bg-ground" />
        <div className="bg-bloom-2" />
        <div className="bg-bloom" />
      </div>

      <Boot />
      <ThemeController />
      <SmoothScroll />
      <Cursor />
      <EasterEggs />

      <main className="content">
        <Hero />
        <Experience />
        <Projects />
        <EarlyWork />
        <ControlRoom />
        <Writing />
        <Approach />
        <Contact />
      </main>

      {/* interactive layer */}
      <Incident />
      <Arcade />
      <Desktop />
      <Terminal />
      <CommandPalette />
      <Toasts />
      <OpsBar />
    </>
  )
}
