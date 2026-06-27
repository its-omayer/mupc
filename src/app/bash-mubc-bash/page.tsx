"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Users, Image as ImageIcon, Trophy, Heart, Activity } from 'lucide-react'

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(data => {
        setStats(data)
        setLoading(false)
      })
      .catch(console.error)
  }, [])

  if (loading) {
    return <div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" /></div>
  }

  return (
    <div className="p-4 md:p-8">
      <h1 className="font-cinzel text-2xl md:text-3xl text-white mb-8">System Overview</h1>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
        <div className="bg-[#18181f] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Users className="w-16 h-16 text-white" /></div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Total Members</p>
          <p className="text-4xl font-bold text-white">{stats?.totalMembers ?? 0}</p>
        </div>
        
        <div className="bg-[#18181f] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><ImageIcon className="w-16 h-16 text-amber-500" /></div>
          <p className="text-amber-500/80 text-sm font-medium uppercase tracking-wider mb-2">Pending Photos</p>
          <p className="text-4xl font-bold text-amber-500">{stats?.pendingPhotos ?? 0}</p>
        </div>
        
        <div className="bg-[#18181f] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Trophy className="w-16 h-16 text-white" /></div>
          <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">Contest Photos</p>
          <p className="text-4xl font-bold text-white">{stats?.approvedContestPhotos ?? 0}</p>
        </div>
        
        <div className="bg-[#18181f] border border-gray-800 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10"><Heart className="w-16 h-16 text-red-500" /></div>
          <p className="text-red-400/80 text-sm font-medium uppercase tracking-wider mb-2">Total Votes</p>
          <p className="text-4xl font-bold text-red-400">{stats?.totalVotes ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-[#18181f] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-gray-800/30 px-6 py-4 border-b border-gray-800">
            <h2 className="text-lg font-semibold text-white">Quick Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-2 gap-4 flex-1">
            {[
              { label: 'Review Pending Photos', href: '/bash-mubc-bash/photos?status=pending', icon: ImageIcon },
              { label: 'Manage Contests', href: '/bash-mubc-bash/contest', icon: Trophy },
              { label: 'User Directory', href: '/bash-mubc-bash/users', icon: Users },
              { label: 'System Logs', href: '/bash-mubc-bash/logs', icon: Activity },
            ].map(action => (
              <Link 
                key={action.href} 
                href={action.href}
                className="bg-[#111118] border border-gray-800 hover:border-amber-500/50 p-4 rounded-lg text-center transition-colors group flex flex-col items-center justify-center"
              >
                <action.icon className="w-8 h-8 text-gray-500 group-hover:text-amber-500 mb-3 transition-colors" />
                <span className="text-sm text-gray-300 font-medium">{action.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="bg-[#18181f] border border-gray-800 rounded-xl overflow-hidden flex flex-col">
          <div className="bg-gray-800/30 px-6 py-4 border-b border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
            <Link href="/bash-mubc-bash/logs" className="text-xs text-amber-500 hover:text-amber-400">View All</Link>
          </div>
          <div className="flex-1 p-0">
            {stats?.recentLogs && stats.recentLogs.length > 0 ? (
              <div className="divide-y divide-gray-800">
                {stats.recentLogs.map((log: any) => (
                  <div key={log._id} className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between">
                    <div>
                      <p className="text-sm text-white font-medium capitalize">{log.action.replace(/_/g, ' ')}</p>
                      <p className="text-xs text-gray-500 mt-1">{log.details}</p>
                    </div>
                    <p className="text-xs text-gray-600 mt-2 sm:mt-0 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500 text-sm">No recent activity logs.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
