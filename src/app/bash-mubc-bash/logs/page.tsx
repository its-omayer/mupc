"use client"

import { useState, useEffect } from 'react'
import { FileText, Clock } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch('/api/admin/logs?limit=50')
        if (res.ok) {
          const data = await res.json()
          setLogs(data.logs || [])
        }
      } catch (err) {
        toast.error('Failed to load system logs')
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [])

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8">
        <h1 className="font-cinzel text-2xl md:text-3xl text-white mb-2">System Logs</h1>
        <p className="text-gray-400 text-sm">Audit trail of administrator actions.</p>
      </div>

      <div className="bg-[#18181f] border border-gray-800 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-gray-800/50 text-gray-400 border-b border-gray-800">
              <tr>
                <th className="px-6 py-4 font-medium">Timestamp</th>
                <th className="px-6 py-4 font-medium">Admin</th>
                <th className="px-6 py-4 font-medium">Action</th>
                <th className="px-6 py-4 font-medium">Target</th>
                <th className="px-6 py-4 font-medium">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800 text-gray-300">
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center"><div className="w-6 h-6 border-2 border-amber-500/30 border-t-amber-500 rounded-full animate-spin mx-auto" /></td></tr>
              ) : logs.length > 0 ? (
                logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 flex items-center">
                      <Clock className="w-3 h-3 mr-2" />
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-medium text-amber-500/80">
                      {log.adminId?.name || 'Unknown Admin'}
                    </td>
                    <td className="px-6 py-4 text-white">
                      <span className="bg-gray-800 px-2 py-1 rounded text-xs uppercase tracking-wider font-semibold">
                        {log.action.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 capitalize">
                      {log.targetType || 'System'}
                    </td>
                    <td className="px-6 py-4 text-gray-400 max-w-xs truncate" title={log.details}>
                      {log.details || '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No logs found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
