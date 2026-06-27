"use client"

import { useState, useEffect } from 'react'
import { Camera, Edit2, Plus, Trophy } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminPhotographersPage() {
  const [photographers, setPhotographers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  
  // Form State
  const [name, setName] = useState('')
  const [bio, setBio] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchPhotographers = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/photographers')
      if (res.ok) {
        const data = await res.json()
        setPhotographers(data.photographers || [])
      }
    } catch (err) {
      toast.error('Failed to load photographers')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotographers()
  }, [])

  const openAdd = () => {
    setEditingId(null)
    setName('')
    setBio('')
    setFile(null)
    setShowModal(true)
  }

  const openEdit = (p: any) => {
    setEditingId(p._id)
    setName(p.name)
    setBio(p.bio || '')
    setFile(null)
    setShowModal(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      let photoData: any = {}

      if (file) {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', 'mupc/photographers')

        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData })
        if (!uploadRes.ok) throw new Error('Upload failed')
        const upData = await uploadRes.json()
        photoData = { bestPhotoUrl: upData.cloudinaryUrl, bestPhotoPublicId: upData.cloudinaryPublicId }
      }

      const method = editingId ? 'PATCH' : 'POST'
      const url = editingId ? `/api/admin/photographers/${editingId}` : '/api/admin/photographers'
      
      const payload = editingId ? { bio, ...photoData } : { name, bio, ...photoData }

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Failed to save')
      }

      toast.success(`Photographer ${editingId ? 'updated' : 'added'}`)
      setShowModal(false)
      fetchPhotographers()
    } catch (err: any) {
      toast.error(err.message || 'An error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="font-cinzel text-2xl md:text-3xl text-white mb-2">Photographers</h1>
          <p className="text-gray-400 text-sm">Manage the official club photographers roster.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-lg font-semibold flex items-center transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Photographer
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" /></div>
      ) : photographers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {photographers.map(p => (
            <div key={p._id} className="bg-[#18181f] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
              <div className="h-48 relative bg-[#0f0f14]">
                {p.bestPhotoUrl ? (
                  <img src={p.bestPhotoUrl} alt={p.name} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    <Camera className="w-12 h-12" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#18181f] to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-xl font-bold text-white">{p.name}</h3>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center text-amber-500 text-sm font-medium mb-3">
                  <Trophy className="w-4 h-4 mr-1" /> {p.wins} Wins
                </div>
                <p className="text-sm text-gray-400 mb-6 flex-1">{p.bio || 'No biography.'}</p>
                <button
                  onClick={() => openEdit(p)}
                  className="w-full py-2 bg-gray-800 hover:bg-gray-700 text-white rounded flex items-center justify-center text-sm transition-colors"
                >
                  <Edit2 className="w-4 h-4 mr-2" /> Edit Profile
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#18181f] rounded-xl border border-gray-800">
          <p className="text-gray-400">No photographers added yet.</p>
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181f] border border-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-semibold text-white mb-4">
              {editingId ? 'Edit Photographer' : 'Add Photographer'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingId && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-[#0f0f14] border border-gray-700 rounded p-2 text-white focus:border-amber-500 outline-none"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm text-gray-400 mb-1">Biography</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0f0f14] border border-gray-700 rounded p-2 text-white focus:border-amber-500 outline-none resize-none"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Best Photo {editingId && '(Optional)'}</label>
                <input
                  type="file"
                  accept="image/*"
                  required={!editingId}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-gray-800 file:text-gray-300 hover:file:bg-gray-700"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-gray-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-500 text-black font-medium rounded hover:bg-amber-600 disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
