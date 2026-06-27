import Link from 'next/link'
import { Instagram, Facebook, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-[#111118] border-t border-amber-500/10 relative overflow-hidden">
      {/* Film strip decorative element */}
      <div className="absolute top-0 left-0 w-full h-1 bg-amber-500/20" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Column 1: About */}
          <div className="space-y-4">
            <h3 className="font-cinzel text-xl font-bold text-amber-400">MUPC</h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
              Monipur Uccha Biddayala Photography Club is dedicated to capturing moments, preserving stories, and nurturing the creative vision of young photographers.
            </p>
            <div className="flex space-x-4 pt-2">
              <a href="#" className="text-gray-500 hover:text-amber-400 transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-500 hover:text-amber-400 transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="mailto:contact@mupc.com" className="text-gray-500 hover:text-amber-400 transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold tracking-wider uppercase text-sm">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contest" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
                  Weekly Contest
                </Link>
              </li>
              <li>
                <Link href="/gallery" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
                  Photo Gallery
                </Link>
              </li>
              <li>
                <Link href="/photographers" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
                  Our Photographers
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-400 hover:text-amber-400 text-sm transition-colors">
                  Hall of Fame
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact */}
          <div className="space-y-4">
            <h3 className="text-white font-semibold tracking-wider uppercase text-sm">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start text-gray-400 text-sm">
                <MapPin className="w-5 h-5 mr-3 text-amber-500/70 shrink-0" />
                <span>Monipur Uccha Biddayala<br />Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center text-gray-400 text-sm">
                <Mail className="w-5 h-5 mr-3 text-amber-500/70 shrink-0" />
                <a href="mailto:contact@mupc.com" className="hover:text-amber-400 transition-colors">
                  contact@mupc.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/5 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Monipur Uccha Biddayala Photography Club. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
