"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Camera, Image as ImageIcon, Bell, Settings, Award, CheckCircle, XCircle, Clock, BookmarkPlus, Eye, Upload } from 'lucide-react'
import { toast } from 'sonner'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { formatRelativeTime } from '@/lib/utils'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'photos' | 'profile' | 'bookmarks' | 'notifications'>('photos')
  const [submissions, setSubmissions] = useState<any[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [savingProfile, setSavingProfile] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') router.push('/signin?callbackUrl=/dashboard')
  }, [status, router])

  useEffect(() => {
    if (status !== 'authenticated') return
    const fetchAll = async () => {
      setLoading(true)
      try {
        const [subRes, profRes, notifRes] = await Promise.all([
          fetch('/api/dashboard/submissions'),
          fetch('/api/dashboard/profile'),
          fetch('/api/notifications')
        ])
        if (subRes.ok) { const d = await subRes.json(); setSubmissions(d.submissions || []) }
        if (profRes.ok) {
          const profData = await profRes.json()
          setProfile(profData)
          setName(profData.name || '')
          setBio(profData.bio || '')
        }
        if (notifRes.ok) { const d = await notifRes.json(); setNotifications(d.notifications || []) }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [status])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSavingProfile(true)
    try {
      let profilePhotoUrl = profile?.profilePhotoUrl
      let profilePhotoPublicId = profile?.profilePhotoPublicId

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'mupc/profiles')
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) throw new Error('Failed to upload photo')
        const upData = await uploadRes.json()
        profilePhotoUrl = upData.cloudinaryUrl
        profilePhotoPublicId = upData.cloudinaryPublicId
      }

      const updateRes = await fetch('/api/dashboard/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, bio, profilePhotoUrl, profilePhotoPublicId })
      })

      if (!updateRes.ok) {
        const err = await updateRes.json()
        throw new Error(err.error || 'Failed to update profile')
      }

      const updatedProfile = await updateRes.json()
      setProfile(updatedProfile)
      setName(updatedProfile.name || '')
      setBio(updatedProfile.bio || '')
      setFile(null)
      toast.success('Profile updated successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Error updating profile')
    } finally {
      setSavingProfile(false)
    }
  }

  const markAllRead = async () => {
    try {
      await fetch('/api/notifications/mark-all-read', { method: 'PATCH' })
      setNotifications(notifications.map(n => ({ ...n, read: true })))
      toast.success('All marked as read')
    } catch (e) {
      toast.error('Failed to mark read')
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    )
  }

  if (!session) return null

  const getStatusBadge = (status: string) => {
    if (status === 'approved') return <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-0.5 rounded text-xs flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Approved</span>
    if (status === 'rejected') return <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-xs flex items-center gap-1"><XCircle className="w-3 h-3" /> Rejected</span>
    return <span className="bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 px-2 py-0.5 rounded text-xs flex items-center gap-1"><Clock className="w-3 h-3" /> Pending</span>
  }

  const tabs = [
    { id: 'photos', label: 'Submissions', icon: ImageIcon },
    { id: 'profile', label: 'Profile', icon: Settings },
    { id: 'bookmarks', label: 'Saved', icon: BookmarkPlus },
    { id: 'notifications', label: 'Notifications', icon: Bell },
  ] as const

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-24">

        {/* User header */}
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <div className="w-14 h-14 md:w-16 md:h-16 rounded-full overflow-hidden border-2 border-amber-500/30 bg-[#18181f] flex-none">
            {profile?.profilePhotoUrl ? (
              <img src={profile.profilePhotoUrl} alt="Profile" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl font-cinzel text-amber-500/50">
                {session.user.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">{session.user.name}</h2>
            <p className="text-gray-500 text-sm capitalize">{session.user.role} · {submissions.length} submissions</p>
          </div>
        </div>

        {/* Tab bar — horizontal scrollable on mobile */}
        <div className="flex gap-1.5 border-b border-white/5 mb-6 overflow-x-auto pb-px scrollbar-none">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 sm:px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors flex-none ${
                  isActive
                    ? 'border-amber-500 text-amber-500'
                    : 'border-transparent text-gray-400 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.id === 'notifications' && unreadCount > 0 && (
                  <span className="w-5 h-5 bg-amber-500 text-black text-xs font-bold rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        <div>
          {/* Submissions Tab */}
          {activeTab === 'photos' && (
            <div className="space-y-6">
              <div className="grid grid-cols-3 gap-3 md:gap-4">
                <div className="bg-[#111118] border border-white/5 p-3 md:p-4 rounded-xl text-center">
                  <div className="text-xl md:text-2xl font-bold text-white">{submissions.length}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Total Uploads</div>
                </div>
                <div className="bg-[#111118] border border-white/5 p-3 md:p-4 rounded-xl text-center">
                  <div className="text-xl md:text-2xl font-bold text-green-400">{submissions.filter(s => s.status === 'approved').length}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Approved</div>
                </div>
                <div className="bg-[#111118] border border-white/5 p-3 md:p-4 rounded-xl text-center">
                  <div className="text-xl md:text-2xl font-bold text-amber-500">{submissions.reduce((sum, s) => sum + (s.votes || 0), 0)}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Total Votes</div>
                </div>
              </div>

              {submissions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {submissions.map(photo => (
                    <div key={photo._id} className="bg-[#111118] border border-white/5 rounded-xl overflow-hidden group">
                      <Link href={`/photos/${photo._id}`} className="block">
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img src={photo.cloudinaryUrl} alt={photo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute top-2 right-2">
                            {getStatusBadge(photo.status)}
                          </div>
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </Link>
                      <div className="p-3 md:p-4">
                        <Link href={`/photos/${photo._id}`}>
                          <h3 className="font-medium text-white truncate text-sm md:text-base hover:text-amber-500 transition-colors">{photo.title}</h3>
                        </Link>
                        <div className="flex justify-between items-center mt-1.5 text-xs text-gray-400">
                          <span>{photo.type === 'contest' ? `Week ${photo.contestWeek?.split('-')[1] || ''}` : 'Gallery'}</span>
                          <span>{photo.votes} votes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#111118] rounded-xl border border-white/5">
                  <Camera className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">You haven't submitted any photos yet.</p>
                  <a href="/contest" className="mt-3 inline-block text-amber-500 hover:text-amber-400 text-sm transition-colors">
                    Enter the weekly contest →
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Profile Tab */}
          {activeTab === 'profile' && (
            <div className="space-y-6 max-w-2xl">
              <div className="bg-[#111118] border border-white/5 rounded-2xl p-5 md:p-8">
                <form onSubmit={handleUpdateProfile} className="space-y-5">
                  {/* Profile photo */}
                  <div className="flex items-center gap-5">
                    <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-2 border-dashed border-white/20 hover:border-amber-500/50 transition-colors cursor-pointer group bg-[#0a0a0f] flex-none">
                      {file ? (
                        <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                      ) : profile?.profilePhotoUrl ? (
                        <img src={profile.profilePhotoUrl} alt="Current" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-600">
                          <Camera className="w-7 h-7" />
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Upload className="w-5 h-5 text-white" />
                      </div>
                      <input type="file" accept="image/*" onChange={e => setFile(e.target.files?.[0] || null)} className="absolute inset-0 opacity-0 cursor-pointer" />
                    </div>
                    <div>
                      <p className="text-white font-medium">{profile?.name}</p>
                      <p className="text-gray-500 text-sm mt-0.5">{profile?.email}</p>
                      <p className="text-xs text-gray-600 mt-2">Tap the photo to change it</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Display Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-amber-500/50 outline-none text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1.5">Biography</label>
                    <textarea
                      value={bio}
                      onChange={e => setBio(e.target.value)}
                      maxLength={300}
                      rows={4}
                      className="w-full bg-[#0a0a0f] border border-white/10 rounded-lg px-4 py-3 text-white focus:border-amber-500/50 outline-none resize-none text-base"
                      placeholder="Tell us about your photography journey…"
                    />
                    <p className="text-xs text-gray-600 text-right mt-1">{bio.length}/300</p>
                  </div>

                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black py-3 rounded-lg font-semibold transition-colors disabled:opacity-50"
                  >
                    {savingProfile ? 'Saving…' : 'Save Changes'}
                  </button>
                </form>
              </div>

              {profile?.badges && profile.badges.length > 0 && (
                <div className="bg-[#111118] border border-white/5 rounded-2xl p-5 md:p-6">
                  <h3 className="font-cinzel text-base md:text-lg text-white mb-4">Earned Badges</h3>
                  <div className="flex flex-wrap gap-2.5">
                    {profile.badges.map((badge: string) => (
                      <div key={badge} className="flex items-center bg-[#0a0a0f] border border-amber-500/20 px-3 py-2 rounded-lg">
                        <Award className="w-4 h-4 text-amber-500 mr-2" />
                        <span className="text-sm font-medium text-amber-400 capitalize">{badge.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Bookmarks Tab */}
          {activeTab === 'bookmarks' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{(profile?.savedPhotos || []).length} saved photo{(profile?.savedPhotos || []).length !== 1 ? 's' : ''}</p>
                <Link href="/gallery" className="text-sm text-amber-500 hover:text-amber-400 transition-colors">
                  Browse Gallery →
                </Link>
              </div>

              {(profile?.savedPhotos || []).length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {(profile.savedPhotos as any[]).map((photo: any) => (
                    <div key={photo._id} className="bg-[#111118] border border-white/5 rounded-xl overflow-hidden group">
                      <Link href={`/photos/${photo._id}`} className="block">
                        <div className="aspect-[4/3] relative overflow-hidden">
                          <img src={photo.cloudinaryUrl} alt={photo.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </Link>
                      <div className="p-3 md:p-4">
                        <Link href={`/photos/${photo._id}`}>
                          <h3 className="font-medium text-white truncate text-sm md:text-base hover:text-amber-500 transition-colors">{photo.title}</h3>
                        </Link>
                        <div className="flex justify-between items-center mt-1.5 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Camera className="w-3 h-3" /> {photo.photographerName}</span>
                          <span>{photo.votes} votes</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 md:py-20 bg-[#111118] rounded-xl border border-white/5">
                  <BookmarkPlus className="w-10 h-10 md:w-12 md:h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm md:text-base">No saved photos yet.</p>
                  <Link href="/gallery" className="mt-3 inline-block text-amber-500 hover:text-amber-400 text-sm transition-colors">
                    Browse Gallery →
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === 'notifications' && (
            <div className="space-y-4 max-w-2xl">
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-500">{notifications.length} notification{notifications.length !== 1 ? 's' : ''}</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-sm text-amber-500 hover:text-amber-400 transition-colors">
                    Mark all as read
                  </button>
                )}
              </div>

              {notifications.length > 0 ? (
                <div className="space-y-2.5">
                  {notifications.map(notif => (
                    <div key={notif._id} className={`p-3.5 md:p-4 rounded-xl border ${notif.read ? 'bg-[#111118] border-white/5' : 'bg-amber-500/5 border-amber-500/20'}`}>
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-full flex-none ${notif.read ? 'bg-white/5 text-gray-400' : 'bg-amber-500/20 text-amber-500'}`}>
                          <Bell className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm ${notif.read ? 'text-gray-300' : 'text-white font-medium'}`}>{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(notif.createdAt)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-[#111118] rounded-xl border border-white/5">
                  <Bell className="w-10 h-10 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-400 text-sm">You're all caught up!</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </main>
  )
}
