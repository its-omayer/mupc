"use client"

import { useState, Suspense } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Camera } from 'lucide-react'
import { toast } from 'sonner'
import { motion } from 'framer-motion'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'

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
        if (res.error === 'ACCOUNT_DISABLED') {
          toast.error('Your account has been disabled.')
        } else {
          toast.error('Invalid credentials. Please try again.')
        }
      } else {
        toast.success('Successfully signed in!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (err) {
      toast.error('An error occurred during sign in.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-amber-500/10 rounded-full blur-[100px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link href="/" className="flex flex-col items-center mb-8">
          <Camera className="w-12 h-12 text-amber-500 mb-4" />
          <span className="font-cinzel text-3xl font-bold text-white tracking-wider">MUPC</span>
          <span className="text-xs text-amber-500/80 uppercase tracking-widest mt-1">Photography Club</span>
        </Link>

        <div className="glass p-8 rounded-2xl border border-amber-500/20 shadow-[0_0_40px_rgba(245,158,11,0.05)]">
          <h2 className="font-cinzel text-2xl font-semibold text-white mb-6 text-center">Member Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-[#18181f] border border-amber-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-[#18181f] border border-amber-500/20 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-amber-500/10 text-center">
            <p className="text-sm text-gray-400 mb-2">
              New member? Contact an administrator to register.
            </p>
            <Link href="/bash-mubc-bash/login" className="text-xs text-amber-500/60 hover:text-amber-500 transition-colors">
              Admins use a separate portal
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="w-8 h-8 border-4 border-amber-500/30 border-t-amber-500 rounded-full animate-spin" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
