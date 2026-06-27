"use client"

import { useState, useEffect, Suspense } from 'react'
import { Check, X, Trash2, Search, Filter } from 'lucide-react'
import { toast } from 'sonner'
import { useSearchParams } from 'next/navigation'

function AdminPhotosContent() {
  const searchParams = useSearchParams()
  const initialStatus = searchParams.get('status') || 'pending'
  
  const [photos, setPhotos] = useState<any[]>([])
  const [statusFilter, setStatusFilter] = useState<string>(initialStatus)
  const [loading, setLoading] = useState(true)

  const fetchPhotos = async () => {
    setLoading(true)
    try {
      const url = statusFilter === 'all' ? '/api/admin/photos' : `/api/admin/photos?status=${statusFilter}`
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setPhotos(data.photos || [])
      }
    } catch (err) {
      toast.error('Failed to load photos')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPhotos()
  }, [statusFilter])

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/photos/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      })
      if (res.ok) {
        toast.success(`Photo ${newStatus}`)
        setPhotos(photos.filter(p => p._id !== id))
      } else {
        toast.error('Failed to update status')
      }
    } catch (err) {
      toast.error('An error occurred')
    }
  }

  const deletePhoto = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this photo?')) return
    try {
      const res = await fetch(`/api/admin/photos/${id}`, { method: 'DELETE' })
      if (res.ok) {
        toast.success('Photo deleted')
        setPhotos(photos.filter(p => p._id !== id))
      } else {
        toast.error('Failed to delete')
      }
    } catch (err) {
      toast.error('An error occurred')
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="font-cinzel text-2xl md:text-3xl text-white mb-2">Photo Moderation</h1>
          <p className="text-gray-400 text-sm">Review and manage member submissions.</p>
        </div>
        
        <div className="flex bg-[#18181f] rounded-lg p-1 border border-gray-800">
          {['pending', 'approved', 'rejected', 'all'].map(status => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-md text-sm font-medium capitalize transition-colors ${
                statusFilter === status 
                  ? 'bg-gray-700 text-white shadow' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" /></div>
      ) : photos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {photos.map(photo => (
            <div key={photo._id} className="bg-[#18181f] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
              <div className="aspect-[4/3] relative group bg-black">
                <img src={photo.cloudinaryUrl} alt={photo.title} className="w-full h-full object-contain" />
                <div className="absolute top-2 right-2 px-2 py-1 bg-black/70 backdrop-blur rounded text-[10px] font-bold uppercase tracking-wider text-gray-300 border border-white/10">
                  {photo.type}
                </div>
              </div>
              
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-white mb-1 truncate" title={photo.title}>{photo.title}</h3>
                <p className="text-sm text-amber-500/80 mb-3 truncate">{photo.photographerName}</p>
                
                <div className="text-xs text-gray-500 mb-4 space-y-1">
                  <p>Uploaded: {new Date(photo.uploadedAt).toLocaleDateString()}</p>
                  <p>Status: <span className="capitalize text-gray-300">{photo.status}</span></p>
                  {photo.contestWeek && <p>Week: {photo.contestWeek}</p>}
                </div>

                <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-gray-800">
                  {photo.status === 'pending' ? (
                    <>
                      <button onClick={() => updateStatus(photo._id, 'approved')} className="flex items-center justify-center bg-green-500/10 text-green-500 hover:bg-green-500/20 py-2 rounded-lg text-sm transition-colors">
                        <Check className="w-4 h-4 mr-1" /> Approve
                      </button>
                      <button onClick={() => updateStatus(photo._id, 'rejected')} className="flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 py-2 rounded-lg text-sm transition-colors">
                        <X className="w-4 h-4 mr-1" /> Reject
                      </button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => updateStatus(photo._id, photo.status === 'approved' ? 'rejected' : 'approved')} className="flex items-center justify-center bg-gray-800 text-gray-300 hover:bg-gray-700 py-2 rounded-lg text-sm transition-colors">
                        {photo.status === 'approved' ? 'Reject' : 'Approve'}
                      </button>
                      <button onClick={() => deletePhoto(photo._id)} className="flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 py-2 rounded-lg text-sm transition-colors">
                        <Trash2 className="w-4 h-4 mr-1" /> Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-[#18181f] rounded-xl border border-gray-800">
          <p className="text-gray-400">No photos found for status "{statusFilter}".</p>
        </div>
      )}
    </div>
  )
}

export default function AdminPhotosPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    }>
      <AdminPhotosContent />
    </Suspense>
  )
}
