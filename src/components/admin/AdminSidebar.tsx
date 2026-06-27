"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { LayoutDashboard, Image as ImageIcon, Trophy, Users, Camera, FileText, LogOut, Menu, X, ShieldAlert } from 'lucide-react'
import { useState } from 'react'

export default function AdminSidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (pathname === '/bash-mubc-bash/login') return null

  const navItems = [
    { label: 'Dashboard', href: '/bash-mubc-bash', icon: LayoutDashboard },
    { label: 'Photos', href: '/bash-mubc-bash/photos', icon: ImageIcon },
    { label: 'Contest Weeks', href: '/bash-mubc-bash/contest', icon: Trophy },
    { label: 'Users', href: '/bash-mubc-bash/users', icon: Users },
    { label: 'Photographers', href: '/bash-mubc-bash/photographers', icon: Camera },
    { label: 'System Logs', href: '/bash-mubc-bash/logs', icon: FileText },
  ]

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-[#18181f] border-b border-gray-800">
        <div className="flex items-center">
          <ShieldAlert className="w-6 h-6 text-red-500 mr-2" />
          <span className="font-cinzel font-bold text-white tracking-widest text-sm">ADMIN</span>
        </div>
        <button onClick={() => setIsOpen(!isOpen)} className="text-gray-400">
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar Desktop & Mobile */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#18181f] border-r border-gray-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-6 hidden md:flex flex-col items-center border-b border-gray-800">
          <ShieldAlert className="w-8 h-8 text-red-500 mb-2" />
          <span className="font-cinzel font-bold text-white tracking-widest">MUPC ADMIN</span>
        </div>

        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' 
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <Icon className="w-5 h-5 mr-3 shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            )
          })}
        </div>

        <div className="p-4 border-t border-gray-800 bg-[#111118]">
          <div className="mb-4 px-2">
            <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Logged in as</p>
            <p className="text-sm font-medium text-white truncate">{session?.user?.name}</p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/bash-mubc-bash/login' })}
            className="w-full flex items-center px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4 mr-2" /> Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}
