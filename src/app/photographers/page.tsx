"use client"

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Camera, Image as ImageIcon } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PhotographersPage() {
  const [photographers, setPhotographers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/photographers')
      .then(res => res.json())
      .then(data => {
        setPhotographers(data.photographers || [])
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16 relative">
          <h1 className="font-cinzel text-4xl md:text-6xl font-bold mb-4 gradient-text">
            Our Photographers
          </h1>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Meet the talented individuals behind the lenses. These visionaries capture the world from unique perspectives and shape the visual identity of MUPC.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 rounded-2xl skeleton" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {photographers.map((p, i) => (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={p._id}
                className="group relative h-96 rounded-2xl overflow-hidden card-hover bg-[#111118]"
              >
                {/* Background Best Photo */}
                <div className="absolute inset-0">
                  {p.bestPhotoUrl ? (
                    <img src={p.bestPhotoUrl} alt={`${p.name}'s best photo`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="w-full h-full bg-[#18181f] flex items-center justify-center">
                      <Camera className="w-16 h-16 text-gray-800" />
                    </div>
                  )}
                  {/* Overlay Gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/80 to-transparent group-hover:from-black group-hover:via-black/90 transition-colors duration-500" />
                </div>

                {/* Content */}
                <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="font-cinzel text-2xl font-bold text-white">{p.name}</h2>
                      {p.wins > 0 && (
                        <div className="flex items-center bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
                          <Trophy className="w-4 h-4 text-amber-500 mr-1.5" />
                          <span className="text-amber-400 font-semibold">{p.wins} Wins</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="h-0 group-hover:h-auto opacity-0 group-hover:opacity-100 overflow-hidden transition-all duration-300 mt-4">
                      <p className="text-gray-300 text-sm leading-relaxed border-l-2 border-amber-500 pl-4">
                        {p.bio || "No biography provided yet. This photographer lets their images speak for themselves."}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Gold Border on Hover */}
                <div className="absolute inset-0 border-2 border-transparent group-hover:border-amber-500/50 rounded-2xl transition-colors duration-300 pointer-events-none" />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </main>
  )
}
