"use client"

import { useState, useEffect } from 'react'
import { Trophy, Calendar, CheckCircle, Trash2, AlertTriangle } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminContestPage() {
  const [weeks, setWeeks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newEndDate, setNewEndDate] = useState('')
  const [creating, setCreating] = useState(false)
  const [clearing, setClearing] = useState(false)
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  const fetchWeeks = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/contestweeks')
      if (res.ok) {
        const data = await res.json()
        setWeeks(data.contestWeeks || [])
      }
    } catch (err) {
      toast.error('Failed to load contest weeks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchWeeks() }, [])

  const createWeek = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newEndDate) return
    setCreating(true)
    try {
      const res = await fetch('/api/admin/contestweeks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endDate: newEndDate })
      })
      if (res.ok) {
        toast.success('Contest week created')
        setNewEndDate('')
        fetchWeeks()
      } else {
        const data = await res.json()
        toast.error(data.error || 'Failed to create')
      }
    } catch (err) {
      toast.error('An error occurred')
    } finally {
      setCreating(false)
    }
  }

  const closeWeek = async (id: string) => {
    if (!confirm('Close this contest and automatically select the top 3 winners? Non-winning photos will be deleted from Cloudinary to save storage. This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/contestweeks/${id}/close`, { method: 'PATCH' })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Contest closed! ${data.winners?.length || 0} winners selected, ${data.deletedCount || 0} photos removed from storage.`)
        fetchWeeks()
      } else {
        toast.error(data.error || 'Failed to close contest')
      }
    } catch (err) {
      toast.error('An error occurred')
    }
  }

  const clearAllContests = async () => {
    setClearing(true)
    try {
      const res = await fetch('/api/admin/contestweeks/clear', { method: 'DELETE' })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Cleared ${data.deletedWeeks} weeks, ${data.deletedPhotos} photos (${data.deletedFromCloudinary} removed from Cloudinary).`)
        setShowClearConfirm(false)
        fetchWeeks()
      } else {
        toast.error(data.error || 'Failed to clear')
      }
    } catch (err) {
      toast.error('An error occurred')
    } finally {
      setClearing(false)
    }
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="font-cinzel text-2xl md:text-3xl text-white mb-2">Contest Management</h1>
          <p className="text-gray-400 text-sm">Create and manage weekly photo contests.</p>
        </div>
        <button
          onClick={() => setShowClearConfirm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg hover:bg-red-500/20 transition-colors text-sm font-medium self-start"
        >
          <Trash2 className="w-4 h-4" /> Clear All Contests
        </button>
      </div>

      {/* Clear confirmation modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#18181f] border border-red-500/30 rounded-xl p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400 mr-3" />
              <h3 className="text-lg font-bold text-white">Clear All Contests</h3>
            </div>
            <p className="text-gray-300 mb-2">This will permanently delete:</p>
            <ul className="text-sm text-gray-400 mb-6 space-y-1 list-disc list-inside">
              <li>All contest weeks (active and closed)</li>
              <li>All contest-type photos from Cloudinary</li>
              <li>All votes</li>
            </ul>
            <p className="text-red-400 text-sm font-medium mb-6">Gallery photos (contest winners) are NOT affected.</p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-700 text-gray-300 hover:bg-white/5 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={clearAllContests}
                disabled={clearing}
                className="flex-1 py-2.5 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition-colors disabled:opacity-50"
              >
                {clearing ? 'Clearing...' : 'Yes, Clear All'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Create New Week Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#18181f] border border-gray-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2 text-amber-500" /> Start New Contest
            </h2>
            <form onSubmit={createWeek} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">End Date</label>
                <input
                  type="date"
                  required
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full bg-[#0f0f14] border border-gray-700 rounded p-2 text-white focus:border-amber-500/50 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={creating}
                className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold py-2 rounded transition-colors disabled:opacity-50"
              >
                {creating ? 'Creating...' : 'Create Contest Week'}
              </button>
            </form>
            <p className="text-xs text-gray-500 mt-4">
              Week ID is auto-generated from the current year and week number. Closing a contest auto-selects the top 3 photos as gallery winners and deletes the rest from Cloudinary.
            </p>
          </div>
        </div>

        {/* List of Weeks */}
        <div className="lg:col-span-2">
          <div className="bg-[#18181f] border border-gray-800 rounded-xl overflow-hidden">
            <div className="bg-gray-800/30 px-6 py-4 border-b border-gray-800">
              <h2 className="text-lg font-semibold text-white flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-amber-500" /> All Contests
              </h2>
            </div>

            {loading ? (
              <div className="p-8 flex justify-center"><div className="w-6 h-6 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" /></div>
            ) : weeks.length > 0 ? (
              <div className="divide-y divide-gray-800">
                {weeks.map(week => (
                  <div key={week._id} className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center mb-1 gap-3">
                        <h3 className="text-xl font-bold text-white">{week.weekId}</h3>
                        {week.isActive ? (
                          <span className="bg-green-500/10 text-green-500 px-2 py-0.5 rounded text-xs font-semibold">Active</span>
                        ) : (
                          <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs font-semibold">Closed</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-400">Ends: {new Date(week.endDate).toLocaleDateString()}</p>
                      <div className="flex gap-4 mt-2 text-sm text-gray-500">
                        <span>Photos: {week.totalPhotos}</span>
                        <span>Votes: {week.totalVotes}</span>
                      </div>
                    </div>

                    <div className="self-start sm:self-center">
                      {week.isActive ? (
                        <button
                          onClick={() => closeWeek(week._id)}
                          className="bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                        >
                          Close & Select Winners
                        </button>
                      ) : week.winnersSelected ? (
                        <span className="flex items-center text-amber-500 text-sm font-medium bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20">
                          <CheckCircle className="w-4 h-4 mr-2" /> Winners Selected
                        </span>
                      ) : (
                        <span className="text-gray-500 text-sm italic">Closed (No winners)</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No contest weeks found. Create one to get started.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
