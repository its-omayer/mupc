"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Bell, Menu, X, Camera, Trophy, Image as ImageIcon, Users, LayoutDashboard, LogOut } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const pathname = usePathname()
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      fetch('/api/notifications')
        .then(res => res.json())
        .then(data => {
          if (data?.unreadCount !== undefined) {
            setUnreadCount(data.unreadCount)
          } else if (Array.isArray(data?.notifications)) {
            setUnreadCount(data.notifications.filter((n: any) => !n.read).length)
          }
        })
        .catch(err => console.error(err))
    }
  }, [session])

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contest', label: 'Contest' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/photographers', label: 'Photographers' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ]

  return (
    <nav className="fixed top-0 z-50 w-full bg-[#0a0a0f]/80 backdrop-blur-lg border-b border-amber-500/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex flex-col justify-center">
            <span className="font-cinzel text-2xl font-bold text-amber-400 tracking-wider">MUPC</span>
            <span className="text-[10px] text-gray-400 uppercase tracking-widest leading-none">Photography Club</span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-amber-400 ${
                  pathname === link.href ? 'text-amber-500' : 'text-gray-300'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-4">
            {session ? (
              <>
                <Link href="/dashboard" className="relative p-2 text-gray-300 hover:text-amber-400 transition-colors">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0a0a0f]" />
                  )}
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="outline-none">
                      <Avatar className="w-9 h-9 border border-amber-500/20">
                        <AvatarImage src={session.user.profilePhotoUrl || ''} />
                        <AvatarFallback className="bg-amber-900 text-amber-100">{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
                      </Avatar>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-[#111118] border-amber-500/10 text-gray-200">
                    <DropdownMenuLabel>
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none text-white">{session.user.name}</p>
                        <p className="text-xs leading-none text-gray-400">{session.user.email}</p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-amber-500/10" />
                    <DropdownMenuItem asChild className="hover:bg-amber-500/10 focus:bg-amber-500/10 cursor-pointer">
                      <Link href="/dashboard" className="w-full flex items-center">
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="hover:bg-amber-500/10 focus:bg-amber-500/10 cursor-pointer">
                      <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full flex items-center text-red-400">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </button>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link href="/signin">
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-semibold rounded-full px-6 transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_25px_rgba(245,158,11,0.5)]">
                  Sign In
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {session && (
              <Link href="/dashboard" className="relative p-2 mr-2 text-gray-300 hover:text-amber-400">
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-[#0a0a0f]" />
                )}
              </Link>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2 flex flex-col gap-1.5 justify-center items-center w-9 h-9"
              aria-label="Toggle menu"
            >
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-5 rotate-45 translate-y-2' : 'w-5'}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? 'opacity-0 w-0' : 'w-4'}`} />
              <span className={`block h-0.5 bg-current transition-all duration-300 ${isOpen ? 'w-5 -rotate-45 -translate-y-2' : 'w-5'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden border-t border-amber-500/10 bg-[#0a0a0f]/95 backdrop-blur-xl">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-3 py-3 rounded-md text-base font-medium ${
                  pathname === link.href ? 'bg-amber-500/10 text-amber-500' : 'text-gray-300 hover:bg-white/5'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {!session && (
              <div className="pt-4">
                <Link href="/signin" onClick={() => setIsOpen(false)}>
                  <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-semibold">
                    Sign In
                  </Button>
                </Link>
              </div>
            )}
            {session && (
              <div className="pt-4 border-t border-amber-500/10 mt-4">
                <div className="flex items-center px-3 mb-4">
                  <Avatar className="w-10 h-10 border border-amber-500/20 mr-3">
                    <AvatarImage src={session.user.profilePhotoUrl || ''} />
                    <AvatarFallback className="bg-amber-900 text-amber-100">{session.user.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium text-white">{session.user.name}</div>
                    <div className="text-sm text-gray-400">{session.user.email}</div>
                  </div>
                </div>
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block px-3 py-3 rounded-md text-base font-medium text-gray-300 hover:bg-white/5 flex items-center"
                >
                  <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
                </Link>
                <button
                  onClick={() => {
                    setIsOpen(false)
                    signOut({ callbackUrl: '/' })
                  }}
                  className="w-full text-left px-3 py-3 rounded-md text-base font-medium text-red-400 hover:bg-white/5 flex items-center mt-1"
                >
                  <LogOut className="w-5 h-5 mr-3" /> Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
