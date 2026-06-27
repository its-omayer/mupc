"use client"

import { useState, useEffect, useCallback, useRef } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight, BookmarkPlus, Eye, Crown, Camera, Filter, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function GalleryPage() {
  const { data: session } = useSession()
  const [photos, setPhotos] = useState<any[]>([])
  const [groupedPhotos, setGroupedPhotos] = useState<Record<string, any[]>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [lightboxPhoto, setLightboxPhoto] = useState<any | null>(null)
  const cacheKeyRef = useRef<string>(new Date().getTime().toString())

  const allTags = ['Street', 'Portrait', 'Landscape', 'Architecture', 'Wildlife', 'Abstract', 'Documentary', 'Night']

  const fetchPhotos = useCallback(async (busted: boolean = false) => {
    const isRefresh = busted || refreshing
    if (!isRefresh) setLoading(true)
    if (isRefresh) setRefreshing(true)
    
    try {
      // Add cache-busting query parameter to force fresh data
      const cacheBuster = busted ? `&t=${new Date().getTime()}` : ''
      const url = selectedTag 
        ? `/api/gallery?tag=${selectedTag}${cacheBuster}` 
        : `/api/gallery${cacheBuster}`
      
      const res = await fetch(url, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
      if (res.ok) {
        const d = await res.json()
        setPhotos(d.photos || [])
        setGroupedPhotos(d.grouped || {})
        if (busted && isRefresh) {
          toast.success('Gallery refreshed!')
        }
      }
    } catch (err) {
      console.error(err)
      if (isRefresh) {
        toast.error('Failed to refresh gallery')
      }
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [selectedTag, refreshing])

  // Initial fetch
  useEffect(() => {
    fetchPhotos(false)
  }, [selectedTag])

  // Poll for new photos every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      fetchPhotos(true)
    }, 30000)
    return () => clearInterval(interval)
  }, [fetchPhotos])

  const handleManualRefresh = async () => {
    await fetchPhotos(true)
  }

  const openLightbox = async (photo: any) => {
    setLightboxPhoto(photo)
    try { await fetch(`/api/photos/${photo._id}/view`, { method: 'PATCH' }) } catch (e) {}
  }

  const navigateLightbox = useCallback((direction: 'prev' | 'next') => {
    if (!lightboxPhoto) return
    const currentIndex = photos.findIndex(p => p._id === lightboxPhoto._id)
    if (direction === 'prev' && currentIndex > 0) setLightboxPhoto(photos[currentIndex - 1])
    else if (direction === 'next' && currentIndex < photos.length - 1) setLightboxPhoto(photos[currentIndex + 1])
  }, [lightboxPhoto, photos])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!lightboxPhoto) return
      if (e.key === 'ArrowLeft') navigateLightbox('prev')
      if (e.key === 'ArrowRight') navigateLightbox('next')
      if (e.key === 'Escape') setLightboxPhoto(null)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [lightboxPhoto, navigateLightbox])

  const handleBookmark = async () => {
    if (!session) { toast.error('Please sign in to bookmark photos'); return }
    if (!lightboxPhoto) return
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: lightboxPhoto._id })
      })
      if (res.ok) toast.success('Photo bookmarked!')
      else toast.error('Failed to bookmark')
    } catch (err) { toast.error('Error bookmarking') }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-400 to-amber-600 text-black p-1.5 rounded-full shadow-lg"><Crown className="w-3.5 h-3.5" /></div>
    if (rank === 2) return <div className="absolute top-2 left-2 bg-gradient-to-r from-gray-300 to-gray-400 text-black p-1.5 rounded-full shadow-lg"><Crown className="w-3.5 h-3.5" /></div>
    if (rank === 3) return <div className="absolute top-2 left-2 bg-gradient-to-r from-amber-700 to-amber-900 text-white p-1.5 rounded-full shadow-lg"><Crown className="w-3.5 h-3.5" /></div>
    return null
  }

  const currentIndex = lightboxPhoto ? photos.findIndex(p => p._id === lightboxPhoto._id) : -1

  // Sort weeks in descending order (newest first)
  const sortedWeeks = Object.keys(groupedPhotos).sort((a, b) => {
    if (a === 'Uncategorized') return 1
    if (b === 'Uncategorized') return -1
    return b.localeCompare(a)
  })

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        <div className="flex flex-col gap-4 mb-8 md:mb-10">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-cinzel text-3xl sm:text-4xl md:text-5xl font-bold mb-3 gradient-text">Community Gallery</h1>
              <p className="text-gray-400 text-sm md:text-base max-w-xl">Explore the finest work from our club members, curated from past weekly contests.</p>
            </div>
            <button
              onClick={handleManualRefresh}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          {/* Tag filters - horizontally scrollable on mobile */}
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap scrollbar-none">
            <button
              onClick={() => setSelectedTag(null)}
              className={`flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                selectedTag === null ? 'bg-amber-500 text-black' : 'bg-[#111118] text-gray-400 border border-white/10 hover:border-amber-500/50'
              }`}
            >
              All Photos
            </button>
            {allTags.map(tag => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`flex-none px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${
                  selectedTag === tag ? 'bg-amber-500 text-black' : 'bg-[#111118] text-gray-400 border border-white/10 hover:border-amber-500/50'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className={`break-inside-avoid skeleton rounded-xl ${i % 3 === 0 ? 'aspect-[3/4]' : i % 2 === 0 ? 'aspect-square' : 'aspect-[4/3]'}`} />
            ))}
          </div>
        ) : photos.length > 0 ? (
          <div className="space-y-12">
            {sortedWeeks.map((week) => (
              <motion.div
                key={week}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                  <h2 className="text-xl md:text-2xl font-bold text-amber-500">
                    {week === 'Uncategorized' ? 'Gallery Submissions' : `Contest Week ${week.split('-')[1] || week}`}
                  </h2>
                  <span className="text-sm text-gray-400">
                    {groupedPhotos[week].length} photo{groupedPhotos[week].length !== 1 ? 's' : ''}
                  </span>
                </div>
                
                <div className="columns-2 sm:columns-2 md:columns-3 lg:columns-4 gap-3 sm:gap-4 space-y-3 sm:space-y-4">
                  {groupedPhotos[week].map((photo, i) => (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      key={photo._id}
                      className="relative break-inside-avoid rounded-lg sm:rounded-xl overflow-hidden group cursor-pointer"
                      onClick={() => openLightbox(photo)}
                    >
                      <img
                        src={photo.cloudinaryUrl}
                        alt={photo.title}
                        className="w-full h-auto object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                      />
                      {photo.weekRank && getRankBadge(photo.weekRank)}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-2 sm:p-4">
                        <h3 className="text-white font-medium text-xs sm:text-sm truncate">{photo.title}</h3>
                        <div className="flex items-center text-amber-500/80 text-xs">
                          <Camera className="w-3 h-3 mr-1 flex-none" />
                          <span className="truncate">{photo.photographerName}</span>
                        </div>
                      </div>
                      
                      {/* Photo link indicator */}
                      <Link
                        href={`/photos/${photo._id}`}
                        className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-amber-500 text-black p-2 rounded-full hover:bg-amber-600"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 md:py-32 bg-[#111118] rounded-2xl border border-white/5">
            <Filter className="w-10 h-10 md:w-12 md:h-12 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400">No photos found in this category.</p>
          </div>
        )}
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/97 backdrop-blur-xl flex flex-col md:flex-row"
            onClick={() => setLightboxPhoto(null)}
          >
            {/* Close */}
            <button
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-3 right-3 sm:top-5 sm:right-5 text-gray-400 hover:text-white z-50 bg-black/60 p-2 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image area */}
            <div
              className="flex-1 flex items-center justify-center relative p-4 pt-14 md:pt-4 min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Prev/Next */}
              {currentIndex > 0 && (
                <button
                  onClick={() => navigateLightbox('prev')}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/60 hover:bg-black/80 p-2 sm:p-3 rounded-full z-10 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-7 sm:h-7" />
                </button>
              )}
              {currentIndex < photos.length - 1 && (
                <button
                  onClick={() => navigateLightbox('next')}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/60 hover:bg-black/80 p-2 sm:p-3 rounded-full z-10 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 sm:w-7 sm:h-7" />
                </button>
              )}

              <img
                src={lightboxPhoto.cloudinaryUrl}
                alt={lightboxPhoto.title}
                className="max-w-full max-h-[55vh] md:max-h-[90vh] object-contain rounded-lg shadow-2xl"
              />

              {/* Mobile counter */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-gray-500 text-xs md:hidden">
                {currentIndex + 1} / {photos.length}
              </div>
            </div>

            {/* Info panel */}
            <div
              className="w-full md:w-72 lg:w-80 bg-[#111118] border-t md:border-t-0 md:border-l border-white/10 p-4 md:p-6 flex flex-col gap-4 overflow-y-auto max-h-[45vh] md:max-h-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div>
                <h2 className="text-lg md:text-2xl font-semibold text-white mb-1">{lightboxPhoto.title}</h2>
                <p className="text-amber-500 font-medium flex items-center text-sm">
                  <Camera className="w-4 h-4 mr-2 flex-none" /> {lightboxPhoto.photographerName}
                </p>
              </div>

              <div className="space-y-2.5">
                {lightboxPhoto.contestWeek && (
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500 text-xs">Contest Week</span>
                    <span className="text-gray-300 text-xs">{lightboxPhoto.contestWeek}</span>
                  </div>
                )}
                {lightboxPhoto.weekRank && (
                  <div className="flex justify-between border-b border-white/5 pb-2">
                    <span className="text-gray-500 text-xs">Rank</span>
                    <span className="text-amber-400 text-xs font-semibold">#{lightboxPhoto.weekRank} Place</span>
                  </div>
                )}
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500 text-xs">Votes</span>
                  <span className="text-gray-300 text-xs font-medium">{lightboxPhoto.votes}</span>
                </div>
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-gray-500 text-xs">Views</span>
                  <span className="text-gray-300 text-xs flex items-center"><Eye className="w-3 h-3 mr-1" /> {lightboxPhoto.views + 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Uploaded</span>
                  <span className="text-gray-300 text-xs">{new Date(lightboxPhoto.uploadedAt).toLocaleDateString()}</span>
                </div>
              </div>

              {lightboxPhoto.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {lightboxPhoto.tags.map((tag: string) => (
                    <span key={tag} className="px-2 py-0.5 bg-white/5 border border-white/10 rounded text-xs text-gray-400">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <Link
                href={`/photos/${lightboxPhoto._id}`}
                className="w-full py-2.5 md:py-3 bg-amber-500 hover:bg-amber-600 text-black rounded-lg flex items-center justify-center font-bold transition-colors text-sm"
              >
                <Eye className="w-4 h-4 mr-2" /> View Full Photo
              </Link>

              <button
                onClick={handleBookmark}
                className="w-full py-2.5 md:py-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/30 rounded-lg flex items-center justify-center font-medium transition-colors text-sm"
              >
                <BookmarkPlus className="w-4 h-4 mr-2" /> Save to Bookmarks
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </main>
  )
}
