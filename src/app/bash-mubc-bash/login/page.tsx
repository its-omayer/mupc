"use client"

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'

export default function AdminLogin() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      if (res?.error) {
        toast.error('Invalid admin credentials.')
      } else {
        const sessionRes = await fetch('/api/auth/session')
        const session = await sessionRes.json()

        if (session?.user?.role !== 'admin') {
          await fetch('/api/auth/signout', { method: 'POST' })
          toast.error('This portal is for administrators only.')
        } else {
          toast.success('Authenticated successfully')
          router.push('/bash-mubc-bash')
          router.refresh()
        }
      }
    } catch (err) {
      toast.error('An error occurred.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0f0f14] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-[#18181f] p-8 rounded-xl border border-gray-800 shadow-2xl">
          <div className="flex flex-col items-center mb-8">
            <ShieldAlert className="w-10 h-10 text-red-500 mb-4" />
            <h1 className="font-cinzel text-2xl font-bold text-white tracking-widest text-center">
              ADMINISTRATION PORTAL
            </h1>
            <p className="text-red-400 text-xs font-semibold tracking-widest mt-2 uppercase">
              Authorized Personnel Only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#0f0f14] border border-gray-700 rounded p-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
                placeholder="admin@mupc.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">
                Passphrase
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#0f0f14] border border-gray-700 rounded p-3 text-white placeholder-gray-600 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/50"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-4 rounded transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Authenticating...' : 'Access Portal'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  )
}
