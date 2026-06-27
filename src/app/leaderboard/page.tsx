"use client"

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Medal, Star, Flame, Crown } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState<'halloffame' | 'current' | 'past'>('halloffame')
  const [hallOfFame, setHallOfFame] = useState<any[]>([])
  const [currentWeek, setCurrentWeek] = useState<any[]>([])
  const [pastPhotos, setPastPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        const [hofRes, currentRes, pastRes] = await Promise.all([
          fetch('/api/photographers'),
          fetch('/api/contest/photos'),
          fetch('/api/gallery?type=gallery')
        ])
        
        if (hofRes.ok) {
          const d = await hofRes.json()
          setHallOfFame(d.photographers || [])
        }
        if (currentRes.ok) {
          const d = await currentRes.json()
          const arr = d.photos || []
          setCurrentWeek([...arr].sort((a: any, b: any) => b.votes - a.votes))
        }
        if (pastRes.ok) {
          const d = await pastRes.json()
          setPastPhotos(d.photos || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const getRankColors = (rank: number) => {
    switch (rank) {
      case 1: return 'from-amber-400 to-amber-600 border-amber-500 shadow-[0_0_30px_rgba(245,158,11,0.2)] text-amber-500'
      case 2: return 'from-gray-300 to-gray-400 border-gray-400 shadow-[0_0_20px_rgba(156,163,175,0.1)] text-gray-300'
      case 3: return 'from-amber-700 to-amber-900 border-amber-800 shadow-[0_0_20px_rgba(180,83,9,0.1)] text-amber-700'
      default: return 'border-white/5 bg-[#111118] text-gray-500'
    }
  }

  // Group past photos by week
  const groupedPast = pastPhotos.reduce((acc, photo) => {
    if (!photo.contestWeek) return acc
    if (!acc[photo.contestWeek]) acc[photo.contestWeek] = []
    acc[photo.contestWeek].push(photo)
    return acc
  }, {} as Record<string, any[]>)

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="font-cinzel text-4xl md:text-5xl font-bold mb-4 text-white">Rankings & Results</h1>
          <p className="text-gray-400 max-w-2xl mx-auto">Tracking excellence and celebrating the top visual creators in our community.</p>
        </div>

        {/* Custom Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveTab('halloffame')}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              activeTab === 'halloffame' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-[#111118] text-gray-400 hover:text-white border border-white/5 hover:border-white/20'
            }`}
          >
            <Star className="w-4 h-4 inline-block mr-2" /> Hall of Fame
          </button>
          <button
            onClick={() => setActiveTab('current')}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              activeTab === 'current' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-[#111118] text-gray-400 hover:text-white border border-white/5 hover:border-white/20'
            }`}
          >
            <Flame className="w-4 h-4 inline-block mr-2" /> Current Week
          </button>
          <button
            onClick={() => setActiveTab('past')}
            className={`px-6 py-3 rounded-full font-medium transition-all ${
              activeTab === 'past' ? 'bg-amber-500 text-black shadow-[0_0_15px_rgba(245,158,11,0.4)]' : 'bg-[#111118] text-gray-400 hover:text-white border border-white/5 hover:border-white/20'
            }`}
          >
            <Trophy className="w-4 h-4 inline-block mr-2" /> Past Contests
          </button>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => <div key={i} className="h-20 skeleton rounded-xl" />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {activeTab === 'halloffame' && (
              <motion.div
                key="hof"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {hallOfFame.filter(p => p.wins > 0).map((photographer, index) => {
                  const rank = index + 1
                  const colors = getRankColors(rank)
                  const isTop3 = rank <= 3
                  
                  return (
                    <div key={photographer._id} className={`flex items-center p-4 md:p-6 rounded-2xl border bg-gradient-to-r ${isTop3 ? `${colors} bg-opacity-10` : 'border-white/5 bg-[#111118]'} transition-transform hover:scale-[1.02]`}>
                      <div className={`w-12 h-12 flex items-center justify-center font-cinzel text-2xl font-bold ${isTop3 ? colors.split(' ').pop() : 'text-gray-500'}`}>
                        {rank === 1 ? <Crown className="w-8 h-8" /> : `#${rank}`}
                      </div>
                      
                      <div className="ml-6 flex-1 flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <h3 className={`text-xl font-bold ${isTop3 ? 'text-white' : 'text-gray-200'}`}>{photographer.name}</h3>
                          <p className="text-gray-400 text-sm mt-1 max-w-md truncate">{photographer.bio || 'MUPC Photographer'}</p>
                        </div>
                        <div className="mt-2 md:mt-0 flex items-center bg-black/40 px-4 py-2 rounded-full border border-white/10">
                          <Trophy className={`w-4 h-4 mr-2 ${isTop3 ? colors.split(' ').pop() : 'text-amber-500'}`} />
                          <span className="font-semibold">{photographer.wins} Wins</span>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {hallOfFame.filter(p => p.wins > 0).length === 0 && (
                  <div className="text-center py-20 text-gray-500 bg-[#111118] rounded-xl border border-white/5">
                    No wins recorded yet.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'current' && (
              <motion.div
                key="current"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {currentWeek.map((photo, index) => {
                  const rank = index + 1
                  return (
                    <div key={photo._id} className="flex items-center p-4 bg-[#111118] border border-white/5 rounded-xl">
                      <div className="w-8 font-cinzel text-xl font-bold text-gray-500 text-center mr-4">
                        {rank}
                      </div>
                      <div className="w-20 h-20 rounded-lg overflow-hidden shrink-0">
                        <img src={photo.cloudinaryUrl} alt={photo.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-lg font-medium text-white">{photo.title}</h3>
                        <p className="text-sm text-gray-400">by {photo.photographerName}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-amber-500">{photo.votes}</div>
                        <div className="text-xs text-gray-500 uppercase">Votes</div>
                      </div>
                    </div>
                  )
                })}
                {currentWeek.length === 0 && (
                  <div className="text-center py-20 text-gray-500 bg-[#111118] rounded-xl border border-white/5">
                    No active contest or no photos submitted yet.
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'past' && (
              <motion.div
                key="past"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-12"
              >
                {Object.keys(groupedPast).sort().reverse().map(weekId => (
                  <div key={weekId} className="bg-[#111118] border border-white/5 rounded-2xl overflow-hidden">
                    <div className="bg-[#18181f] px-6 py-4 border-b border-white/5 flex items-center justify-between">
                      <h3 className="font-cinzel text-xl font-bold text-white">Contest {weekId}</h3>
                      <span className="text-amber-500 text-sm font-medium">Final Results</span>
                    </div>
                    <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                      {groupedPast[weekId].sort((a: any, b: any) => (a.weekRank || 99) - (b.weekRank || 99)).map((photo: any) => (
                        <div key={photo._id} className="relative group rounded-lg overflow-hidden border border-white/10">
                          <div className="aspect-[4/3]">
                            <img src={photo.cloudinaryUrl} alt={photo.title} className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute top-2 left-2 flex items-center bg-black/80 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                            {photo.weekRank === 1 && <Crown className="w-4 h-4 text-amber-400 mr-2" />}
                            {photo.weekRank === 2 && <Crown className="w-4 h-4 text-gray-300 mr-2" />}
                            {photo.weekRank === 3 && <Crown className="w-4 h-4 text-amber-700 mr-2" />}
                            <span className="text-white font-bold text-sm">Rank #{photo.weekRank}</span>
                          </div>
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-4">
                            <p className="text-white font-medium truncate">{photo.title}</p>
                            <p className="text-amber-500/80 text-sm truncate">{photo.photographerName}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {Object.keys(groupedPast).length === 0 && (
                  <div className="text-center py-20 text-gray-500 bg-[#111118] rounded-xl border border-white/5">
                    No past contest results available.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      <Footer />
    </main>
  )
}
