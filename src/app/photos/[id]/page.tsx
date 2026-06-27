"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { X, ChevronLeft, BookmarkPlus, Eye, Crown, Camera, ArrowLeft, ExternalLink, Calendar, Award, ThumbsUp } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function PhotoDetailPage() {
  const { data: session } = useSession()
  const params = useParams()
  const router = useRouter()
  const photoId = params.id as string

  const [photo, setPhoto] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [hasVoted, setHasVoted] = useState(false)
  const [votesCount, setVotesCount] = useState(0)

  useEffect(() => {
    if (!photoId) return
    const fetchPhoto = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/photos/${photoId}`)
        if (res.ok) {
          const d = await res.json()
          setPhoto(d)
          setVotesCount(d.votes || 0)
          
          // Increment views
          await fetch(`/api/photos/${photoId}/view`, { method: 'PATCH' })
        } else {
          toast.error('Photo not found')
        }
      } catch (err) {
        console.error(err)
        toast.error('Failed to load photo')
      } finally {
        setLoading(false)
      }
    }
    fetchPhoto()
  }, [photoId])

  // Check if bookmarked
  useEffect(() => {
    if (!session || !photo) return
    const checkBookmark = async () => {
      try {
        const res = await fetch('/api/dashboard/profile')
        if (res.ok) {
          const profile = await res.json()
          const savedIds = profile.savedPhotos?.map((p: any) => p._id || p) || []
          setIsBookmarked(savedIds.includes(photo._id))
        }
      } catch (e) {
        console.error(e)
      }
    }
    checkBookmark()
  }, [session, photo])

  const handleBookmark = async () => {
    if (!session) {
      toast.error('Please sign in to bookmark photos')
      router.push('/signin?callbackUrl=/photos/' + photoId)
      return
    }
    const action = isBookmarked ? 'unsave' : 'save'
    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: photo._id, action })
      })
      if (res.ok) {
        setIsBookmarked(!isBookmarked)
        toast.success(isBookmarked ? 'Removed from bookmarks' : 'Added to bookmarks!')
      } else {
        toast.error('Failed to update bookmark')
      }
    } catch (err) {
      toast.error('Error bookmarking')
    }
  }

  const handleVote = async () => {
    if (!session) {
      toast.error('Please sign in to vote')
      router.push('/signin?callbackUrl=/photos/' + photoId)
      return
    }
    if (photo.type !== 'contest') {
      toast.error('Voting is only available for contest photos')
      return
    }
    try {
      const res = await fetch('/api/contest/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId: photo._id })
      })
      const data = await res.json()
      if (res.ok) {
        setVotesCount(prev => prev + 1)
        setHasVoted(true)
        toast.success('Vote cast successfully!')
      } else {
        toast.error(data.error || 'Failed to submit vote')
      }
    } catch (err) {
      toast.error('Error casting vote')
    }
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-amber-600 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg"><Crown className="w-3.5 h-3.5" /> 1st Place Winner</div>
    if (rank === 2) return <div className="flex items-center gap-1.5 bg-gradient-to-r from-gray-300 to-gray-400 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg"><Crown className="w-3.5 h-3.5" /> 2nd Place</div>
    if (rank === 3) return <div className="flex items-center gap-1.5 bg-gradient-to-r from-amber-700 to-amber-900 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg"><Crown className="w-3.5 h-3.5" /> 3rd Place</div>
    return null
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 flex items-center justify-center min-h-[60vh]">
          <div className="w-12 h-12 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
        </div>
        <Footer />
      </main>
    )
  }

  if (!photo) {
    return (
      <main className="min-h-screen bg-[#0a0a0f] text-white">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <Camera className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Photo Not Found</h2>
          <p className="text-gray-400 mb-6">The photo you are looking for does not exist or has been deleted.</p>
          <button onClick={() => router.back()} className="px-6 py-2.5 bg-amber-500 text-black font-semibold rounded-lg hover:bg-amber-600 transition-all">
            Go Back
          </button>
        </div>
        <Footer />
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white relative">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        {/* Back Link */}
        <button 
          onClick={() => router.back()}
          className="flex items-center text-amber-500 hover:text-amber-400 transition-colors mb-6 md:mb-8 font-medium group"
        >
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Photo Preview Column */}
          <div className="lg:col-span-8 bg-[#111118] border border-white/5 rounded-2xl p-4 md:p-6 shadow-2xl flex flex-col items-center justify-center relative overflow-hidden group">
            {/* Background blur */}
            <div className="absolute inset-0 opacity-10 bg-cover bg-center blur-2xl scale-110 pointer-events-none" style={{ backgroundImage: `url(${photo.cloudinaryUrl})` }} />
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 w-full max-h-[75vh] flex justify-center"
            >
              <img 
                src={photo.cloudinaryUrl} 
                alt={photo.title}
                className="max-w-full max-h-[70vh] object-contain rounded-xl shadow-2xl border border-white/10"
              />
            </motion.div>
            
            {/* Photo Toolbar */}
            <div className="w-full flex justify-between items-center mt-6 pt-4 border-t border-white/5 relative z-10">
              <span className="text-gray-500 text-xs sm:text-sm">
                ID: {photo._id}
              </span>
              <a 
                href={photo.cloudinaryUrl} 
                target="_blank" 
                rel="noreferrer"
                className="flex items-center text-xs text-amber-500 hover:text-amber-400 transition-colors font-medium"
              >
                Open Original <ExternalLink className="w-3.5 h-3.5 ml-1.5" />
              </a>
            </div>
          </div>

          {/* Details Column */}
          <div className="lg:col-span-4 space-y-6">
            {/* Main Info */}
            <div className="glass border border-amber-500/20 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="mb-4">
                {photo.weekRank && (
                  <div className="mb-3">
                    {getRankBadge(photo.weekRank)}
                  </div>
                )}
                <h1 className="font-cinzel text-2xl md:text-3xl font-bold text-white leading-tight mb-2">
                  {photo.title}
                </h1>
                
                <div className="flex items-center gap-2 mt-2">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/20 font-cinzel text-sm font-semibold">
                    {photo.photographerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 leading-none">Photographer</p>
                    <p className="text-sm font-medium text-amber-500 mt-1">{photo.photographerName}</p>
                  </div>
                </div>
              </div>

              {/* Tags */}
              {photo.tags && photo.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-4 pt-4 border-t border-white/5">
                  {photo.tags.map((tag: string) => (
                    <span 
                      key={tag} 
                      className="px-2.5 py-1 bg-white/5 border border-white/10 rounded-md text-xs text-gray-400 font-medium"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Statistics and Metadata */}
            <div className="bg-[#111118] border border-white/5 rounded-2xl p-6 space-y-4 shadow-xl">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-widest border-b border-white/5 pb-2">
                Photo Metadata
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#18181f] border border-white/5 p-3 rounded-xl">
                  <span className="text-gray-500 text-xs block mb-1">Views</span>
                  <span className="text-base font-bold text-white flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-gray-400" />
                    {photo.views + 1}
                  </span>
                </div>
                <div className="bg-[#18181f] border border-white/5 p-3 rounded-xl">
                  <span className="text-gray-500 text-xs block mb-1">Votes</span>
                  <span className="text-base font-bold text-white flex items-center gap-1.5">
                    <ThumbsUp className="w-4 h-4 text-gray-400" />
                    {votesCount}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2 text-sm text-gray-300">
                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-500 text-xs flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-gray-400" /> Upload Date
                  </span>
                  <span className="text-xs font-medium text-gray-200">
                    {new Date(photo.uploadedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-white/5">
                  <span className="text-gray-500 text-xs flex items-center gap-2">
                    <Award className="w-3.5 h-3.5 text-gray-400" /> Submission Type
                  </span>
                  <span className="text-xs font-medium text-amber-500 capitalize">
                    {photo.type}
                  </span>
                </div>

                {photo.contestWeek && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-gray-500 text-xs flex items-center gap-2">
                      <Crown className="w-3.5 h-3.5 text-gray-400" /> Contest Week
                    </span>
                    <span className="text-xs font-medium text-gray-200">
                      Week {photo.contestWeek.split('-')[1] || photo.contestWeek}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* User Interaction Actions */}
            <div className="space-y-3">
              {photo.type === 'contest' && !hasVoted && (
                <button
                  onClick={handleVote}
                  className="w-full py-3.5 bg-amber-500 text-black hover:bg-amber-600 font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-amber-500/10"
                >
                  <ThumbsUp className="w-4 h-4" /> Vote for this Photo
                </button>
              )}
              
              <button
                onClick={handleBookmark}
                className={`w-full py-3.5 border rounded-xl flex items-center justify-center gap-2 font-semibold transition-all ${
                  isBookmarked
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/50 hover:bg-amber-500/30'
                    : 'bg-white/5 text-gray-300 border-white/10 hover:bg-white/10 hover:text-white'
                }`}
              >
                <BookmarkPlus className="w-4 h-4" />
                {isBookmarked ? 'Remove from Bookmarks' : 'Save to Bookmarks'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  )
}
