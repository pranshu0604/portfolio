'use client'
import { useState } from "react";
import { Signika, Squada_One } from "next/font/google";
const signika = Signika({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
});
const squadaone = Squada_One({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal"],
});

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="border-b border-zinc-800/30 bg-zinc-900/30 backdrop-blur-xl fixed w-screen top-0 z-50 shadow-lg">
      <div className="container mx-auto px-6 sm:px-8 md:px-16 lg:px-24 xl:px-32">
        <div className="flex items-center justify-between h-20">
          <div className={`text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 cursor-pointer ${squadaone.className}`} onClick={() => scrollToSection('home')}>
            Pranshu Pandey
          </div>
          
          <div className={`max-sm:hidden flex items-center space-x-8 ${signika.className}`}>
            <button onClick={() => scrollToSection('home')} className="relative text-zinc-300 hover:text-white transition-colors text-lg group">
              Home
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full"></span>
            </button>
            <button onClick={() => scrollToSection('artists')} className="relative text-zinc-300 hover:text-white transition-colors text-lg group">
              Projects
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full"></span>
            </button>
            <button onClick={() => scrollToSection('trending')} className="relative text-zinc-300 hover:text-white transition-colors text-lg group">
              Skills
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full"></span>
            </button>
            <button onClick={() => scrollToSection('connect')} className="relative text-zinc-300 hover:text-white transition-colors text-lg group">
              Connect
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-purple-500 transition-all group-hover:w-full"></span>
            </button>
          </div>

            <div className="sm:hidden relative">
            <button 
              onClick={() => setIsOpen(!isOpen)} 
              className="text-zinc-300 hover:text-white transition-colors text-lg"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-zinc-900/95 rounded-md shadow-lg py-1 backdrop-blur-xl">
              <button 
                onClick={() => { scrollToSection('home'); setIsOpen(false); }}
                className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 w-full text-left"
              >
                Home
              </button>
              <button 
                onClick={() => { scrollToSection('artists'); setIsOpen(false); }}
                className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 w-full text-left"
              >
                Projects
              </button>
              <button 
                onClick={() => { scrollToSection('trending'); setIsOpen(false); }}
                className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 w-full text-left"
              >
                Skills
              </button>
              <button 
                onClick={() => { scrollToSection('connect'); setIsOpen(false); }}
                className="block px-4 py-2 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 w-full text-left"
              >
                Connect
              </button>
              </div>
            )}
            </div>

        </div>
      </div>
    </nav>
  )
}
