'use client'
import Image from 'next/image'
import Navbar from './components/navbar'
import Stats from './components/stats'
import TrendingSection from './components/trending-section'
import TopArtists from './components/top-artists'
import Footer from './components/footer'
import { Signika, Caveat_Brush } from 'next/font/google'
const signika = Signika({
  subsets: ['latin'],
  weight: ['600'],
  style: ['normal']
})
const caveatbrush = Caveat_Brush({
  subsets: ['latin'],
  weight: ['400'],
  style: ['normal']
})

export default function Home() {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <div className={`min-h-screen bg-[#0a0a0a] text-white relative overflow-hidden`}>
      {/* Bright and Vibrant Glassmorphism Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Gradient 1: Purple */}
        <div className="absolute -top-32 -left-32 w-[400px] h-[400px] bg-[#9b5de5]/50 rounded-full blur-[200px] animate-pulse" />

        {/* Gradient 2: Yellow */}
        <div className="absolute -top-20 right-10 w-[500px] h-[500px] bg-[#fecd1a]/40 rounded-full blur-[150px] animate-pulse" />

        {/* Gradient 3: Aqua */}
        <div className="absolute top-1/3 -left-20 w-[350px] h-[350px] bg-[#00f5d4]/40 rounded-full blur-[180px] animate-pulse" />

        {/* Gradient 4: Pink */}
        <div className="absolute top-1/2 -right-32 w-[450px] h-[450px] bg-[#ff477e]/30 rounded-full blur-[200px] animate-pulse" />

        {/* Gradient 5: Yellow */}
        <div className="absolute bottom-16 -left-32 w-[400px] h-[400px] bg-[#fecd1a]/30 rounded-full blur-[150px] animate-pulse" />

        {/* Gradient 6: Purple */}
        <div className="absolute -bottom-32 right-10 w-[500px] h-[500px] bg-[#9b5de5]/40 rounded-full blur-[180px] animate-pulse" />
      </div>

      {/* Glass Overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-md" />

      {/* Content */}
      <div className="relative z-10">
        <Navbar />

        <main className="container mx-auto px-6 sm:px-8 md:px-16 lg:px-24 xl:px-32">
          {/* Hero Section */}
          <section id="home" className="relative max-lg:py-20 lg:pt-32">
            <div className="md:grid md:grid-cols-2 md:gap-12 items-center max-md:flex max-md:flex-col-reverse">
              {/* Left Content */}
              <div className="space-y-8">
                <h1 className={`text-6xl lg:text-7xl font-bold leading-tight mb-6 ${caveatbrush.className}`}>
                You Dream It.<br />I Code It.<br />We Kill It.
                </h1>
                <p className={`text-zinc-300 text-lg max-w-lg mb-8  ${signika.className}`}>
                I'm Pranshu—an Allstack Web Developer, Critical Thinker, and Problem Solver. Let's turn your wildest ideas into reality.
                </p>
                <div className="flex gap-4">
                  {/* Placeholder for buttons or actions */}
                <button onClick={() => scrollToSection('connect')} className={`px-8 py-3 bg-purple-500/20 backdrop-blur-md border border-purple-300/30 hover:bg-purple-500/30 rounded-full text-purple-100 font-semibold transition-all shadow-lg flex items-center gap-2 ${signika.className}`}>
                  <span>Let's Connect</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
                <button onClick={() => scrollToSection('artists')} className={`px-8 py-3 bg-teal-500/20 backdrop-blur-md border border-teal-300/30 hover:bg-teal-500/30 rounded-full text-teal-100 font-semibold transition-all shadow-lg flex items-center gap-2 ${signika.className}`}>
                  <span>View My Work</span>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
                </div>
              </div>

              {/* Right Content */}
              <div className="relative">
                <Image
                  src="/pran2.png"
                  alt="Digital Art"
                  width={600}
                  height={600}
                  className="rounded-2xl"
                />
                <div className="absolute -top-4 -right-4 w-32 h-32 bg-[#fecd1a]/30 rounded-full blur-xl" />
                <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-[#00f5d4]/30 rounded-full blur-xl" />
              </div>
            </div>
          </section>

          {/* Other Sections */}
          <section id="trending">
            <TrendingSection />
          </section>
          <section id="artists">
            <TopArtists />
          </section>
          <section id="connect">
            <Stats />
          </section>
        </main>

        <Footer />
      </div>
    </div>
  )
}