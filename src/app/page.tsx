import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Trophy, Image as ImageIcon, Star, ChevronDown, Camera, Users, Award } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const Hero3D = dynamic(() => import('@/components/Hero3D'), { ssr: false })

export default function Home() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      {/* Section 1 - Hero */}
      <section className="relative h-screen flex flex-col items-center justify-center overflow-hidden">
        <Hero3D />
        
        <div className="relative z-10 text-center px-4 max-w-5xl mx-auto mt-16">
          <div className="inline-block mb-4 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 backdrop-blur-sm">
            <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Est. 2017</span>
          </div>
          <h1 className="font-cinzel text-5xl md:text-7xl lg:text-8xl font-bold mb-4 tracking-tight">
            <span className="gradient-text">MONIPUR UCCHA</span>
            <br />
            <span className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">BIDDAYALA</span>
          </h1>
          <h2 className="text-xl md:text-2xl text-amber-500/90 font-light tracking-[0.3em] mb-8">
            PHOTOGRAPHY CLUB
          </h2>
          <p className="text-gray-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light">
            Capturing Moments. Preserving Stories.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/gallery" className="w-full sm:w-auto px-8 py-4 bg-amber-500 hover:bg-amber-600 text-black font-bold rounded-full transition-all hover:scale-105 shadow-[0_0_20px_rgba(245,158,11,0.4)]">
              Explore Gallery
            </Link>
            <Link href="/contest" className="w-full sm:w-auto px-8 py-4 bg-transparent border border-amber-500/30 text-amber-400 hover:border-amber-400 hover:bg-amber-500/10 font-bold rounded-full transition-all">
              Join Contest
            </Link>
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-8 h-8 text-amber-500/70" />
        </div>
      </section>

      {/* Section 2 - Features */}
      <section className="py-24 bg-[#111118] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass p-8 rounded-2xl card-hover text-center">
              <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                <Trophy className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="font-cinzel text-xl font-bold mb-4 text-white">Weekly Contest</h3>
              <p className="text-gray-400">Submit your best shots to our themed weekly contests and compete for the top spot on the leaderboard.</p>
            </div>
            <div className="glass p-8 rounded-2xl card-hover text-center">
              <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                <ImageIcon className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="font-cinzel text-xl font-bold mb-4 text-white">Community Gallery</h3>
              <p className="text-gray-400">Browse a curated collection of stunning photographs captured by our talented club members.</p>
            </div>
            <div className="glass p-8 rounded-2xl card-hover text-center">
              <div className="w-16 h-16 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-amber-500" />
              </div>
              <h3 className="font-cinzel text-xl font-bold mb-4 text-white">Hall of Fame</h3>
              <p className="text-gray-400">Celebrate our most decorated photographers and their award-winning masterpieces.</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
