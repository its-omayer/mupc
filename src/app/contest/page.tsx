"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Camera, Clock, Upload, Check, Image as ImageIcon, Heart, X } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ContestPage() {
  const { data: session } = useSession()
  const [activeWeek, setActiveWeek] = useState<any>(null)
  const [photos, setPhotos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitLoading, setSubmitLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  const availableTags = ['Street', 'Portrait', 'Landscape', 'Architecture', 'Wildlife', 'Abstract', 'Documentary', 'Night']

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [weekRes, photosRes] = await Promise.all([
          fetch('/api/contest/active'),
          fetch('/api/contest/photos')
        ])
        if (weekRes.ok) {
          const d = await weekRes.json()
          setActiveWeek(d.activeWeek ?? null)
        }
        if (photosRes.ok) {
          const d = await photosRes.json()
          setPhotos(d.photos || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleVote = async (photoId: string) => {
    if (!session) {
      toast.error('Please sign in to vote')
      return
    }
    try {
      const res = await fetch('/api/contest/vote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ photoId })
      })
      if (res.ok) {
        toast.success('Vote recorded!')
        setPhotos(photos.map(p => p._id === photoId ? { ...p, votes: p.votes + 1, hasVoted: true } : p))
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to vote')
      }
    } catch (err) {
      toast.error('Error recording vote')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return toast.error('Please select a photo')
    if (selectedTags.length === 0) return toast.error('Select at least one tag')

    setSubmitLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('folder', 'mupc/contest')

      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
      if (!uploadRes.ok) throw new Error('Upload failed')
      const { cloudinaryUrl, cloudinaryPublicId } = await uploadRes.json()

      const submitRes = await fetch('/api/contest/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cloudinaryUrl, cloudinaryPublicId, title, tags: selectedTags })
      })

      if (!submitRes.ok) {
        const err = await submitRes.json()
        throw new Error(err.error || 'Failed to submit')
      }

      toast.success('Photo submitted! Pending admin approval.')
      setShowSubmitModal(false)
      setTitle('')
      setFile(null)
      setSelectedTags([])
    } catch (err: any) {
      toast.error(err.message || 'Error submitting photo')
    } finally {
      setSubmitLoading(false)
    }
  }

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag))
    } else if (selectedTags.length < 3) {
      setSelectedTags([...selectedTags, tag])
    } else {
      toast.error('Maximum 3 tags allowed')
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">
        {/* Header */}
        <div className="text-center mb-10 md:mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          <h1 className="font-cinzel text-3xl sm:text-4xl md:text-6xl font-bold mb-6 gradient-text relative z-10">
            Weekly Contest
          </h1>

          {loading ? (
            <div className="h-20 flex items-center justify-center">
              <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
            </div>
          ) : activeWeek ? (
            <div className="bg-[#111118] border border-amber-500/20 rounded-2xl p-4 md:p-6 max-w-2xl mx-auto relative z-10 shadow-[0_0_30px_rgba(245,158,11,0.05)]">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <h2 className="text-lg md:text-xl font-semibold text-white mb-1">Week {activeWeek.weekId.split('-')[1]}</h2>
                  <div className="flex items-center justify-center sm:justify-start text-gray-400 text-sm">
                    <Clock className="w-4 h-4 mr-2 text-amber-500" />
                    Ends {new Date(activeWeek.endDate).toLocaleDateString()}
                  </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-center px-3 sm:px-4 border-r border-amber-500/10">
                    <div className="text-xl md:text-2xl font-bold text-amber-400">{activeWeek.totalPhotos || photos.length}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-wider">Entries</div>
                  </div>
                  {session?.user ? (
                    <button
                      onClick={() => setShowSubmitModal(true)}
                      className="bg-amber-500 hover:bg-amber-600 text-black px-4 sm:px-6 py-2 rounded-full font-semibold transition-all flex items-center text-sm sm:text-base shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    >
                      <Upload className="w-4 h-4 mr-1.5" /> Submit
                    </button>
                  ) : (
                    <a href="/signin" className="bg-white/5 border border-white/10 text-gray-300 hover:text-white px-4 py-2 rounded-full text-sm transition-colors whitespace-nowrap">
                      Sign in to submit
                    </a>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-gray-400 text-base md:text-lg relative z-10 bg-[#111118] border border-white/5 py-8 rounded-xl max-w-lg mx-auto">
              <Camera className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-4 text-gray-600" />
              No active contest this week. Check back later!
            </div>
          )}
        </div>

        {/* Photo Grid */}
        {!loading && activeWeek && (
          photos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {photos.map((photo, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  key={photo._id}
                  className="bg-[#111118] border border-white/5 rounded-xl overflow-hidden group card-hover"
                >
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <img
                      src={photo.cloudinaryUrl}
                      alt={photo.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
                      {photo.tags.slice(0, 2).map((tag: string) => (
                        <span key={tag} className="px-2 py-0.5 bg-black/60 backdrop-blur-md border border-white/10 rounded text-xs text-gray-300">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-4 md:p-5 relative">
                    <div className="absolute -top-6 right-4 bg-[#0a0a0f] border border-amber-500/20 rounded-full px-3 py-1.5 flex items-center shadow-lg">
                      <Heart className="w-3.5 h-3.5 text-amber-500 mr-1.5" fill={photo.hasVoted ? "#f59e0b" : "none"} />
                      <span className="font-semibold text-amber-400 text-sm">{photo.votes}</span>
                    </div>

                    <h3 className="text-base md:text-lg font-medium text-white mb-1 truncate">{photo.title}</h3>
                    <p className="text-sm text-gray-400 mb-3 truncate">by {photo.photographerName}</p>

                    <button
                      onClick={() => handleVote(photo._id)}
                      disabled={photo.hasVoted || !activeWeek?.isActive}
                      className={`w-full py-2.5 rounded-lg flex items-center justify-center font-medium transition-colors text-sm ${
                        photo.hasVoted
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20 cursor-default'
                          : 'bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 active:bg-white/15'
                      }`}
                    >
                      {photo.hasVoted ? (
                        <><Check className="w-4 h-4 mr-2" /> Voted</>
                      ) : 'Vote for this photo'}
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 md:py-20 text-gray-500 bg-[#111118] border border-white/5 rounded-2xl">
              <ImageIcon className="w-12 h-12 md:w-16 md:h-16 mx-auto mb-4 opacity-50" />
              <p className="text-base md:text-lg">No photos submitted yet for this week.</p>
              {session?.user && (
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="mt-4 bg-amber-500 hover:bg-amber-600 text-black px-6 py-2.5 rounded-full font-semibold transition-all text-sm"
                >
                  Be the first to submit!
                </button>
              )}
            </div>
          )
        )}
      </div>

      {/* Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#111118] border border-amber-500/20 rounded-t-2xl sm:rounded-2xl p-5 md:p-6 w-full sm:max-w-lg shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowSubmitModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="font-cinzel text-xl md:text-2xl font-bold text-amber-400 mb-5">Submit to Contest</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-2">Photo Title</label>
                <input
                  type="text"
                  required
                  maxLength={50}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-amber-500/50 outline-none text-base"
                  placeholder="E.g., Golden Hour at TSC"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Categories/Tags (Max 3)</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map(tag => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                          : 'bg-[#0a0a0f] border-white/10 text-gray-400 hover:border-white/30'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">Photo File</label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-5 text-center bg-[#0a0a0f] hover:border-amber-500/30 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
                    <Upload className="w-7 h-7 text-gray-500 mb-2" />
                    <span className="text-amber-500 font-medium text-sm">Tap to select photo</span>
                    <span className="text-gray-500 text-xs mt-1">{file ? file.name : 'Max 10MB · JPEG, PNG, WebP'}</span>
                  </label>
                </div>
              </div>

              <div className="pt-3 flex gap-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowSubmitModal(false)}
                  className="flex-1 py-3 rounded-lg text-gray-400 hover:text-white bg-white/5 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading || !file}
                  className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  {submitLoading ? (
                    <><div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin mr-2" /> Uploading…</>
                  ) : 'Submit Photo'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <Footer />
    </main>
  )
}
