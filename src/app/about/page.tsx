"use client"

import { motion } from 'framer-motion'
import { Trophy, Medal, Camera, BookOpen, Users, Star, MapPin, Calendar, Award } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.1, ease: 'easeOut' },
  }),
}

const timelineEvents = [
  {
    year: '2017',
    label: 'Club Founded',
    description:
      'MUPC was founded in 2017 under Branch 1 (Boys) by Sifat Rahman, laying the foundation for a student-led photography community at Monipur Uccha Biddayala and College.',
  },
  {
    year: '2024',
    label: 'Official College Recognition',
    description:
      'After the historic July Movement of 2024, MUPC received official recognition in the College branch, endorsed by the College founding panel and its moderators — marking a new chapter for the club.',
  },
  {
    year: '2024',
    label: 'First College Auditorium Session',
    description:
      'MUPC hosted its landmark first session in the College Auditorium. The session was hosted by Fairooz Anika and conducted by Muhammad Afif Haider on the topic: Basics of Video Editing.',
  },
  {
    year: '2025',
    label: 'Best Club Partner Award',
    description:
      'MUPC was awarded Best Club Partner at GSCPC Reflections 2.0, recognising the club\'s collaborative spirit and excellence.',
  },
  {
    year: '2025',
    label: 'Best Club Award at NDC',
    description:
      'MUPC won the Best Club Award at NDC 9th National Cultural Jubilation 2025 — a landmark achievement for the club.',
  },
  {
    year: '2025',
    label: 'Club Representatives Honoured',
    description:
      'Muhammad Afif Haider represented MUPC at the NDC Cultural Club 2025. Taharat Tasnim Raya represented the club at Frame the Moment Season 4, 2025.',
  },
  {
    year: 'Now',
    label: 'Growing Strong',
    description:
      'With 20+ event covers, multiple citywide photowalks, and a passionate community of student photographers, MUPC continues to grow as one of the most active student clubs in Mirpur, Dhaka.',
  },
]

const achievements = [
  { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', title: 'Best Club Partner Award', sub: 'GSCPC Reflections 2.0' },
  { icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', title: 'Best Club Award', sub: 'NDC 9th National Cultural Jubilation 2025' },
  { icon: Medal, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', title: 'Club Representative', sub: 'Muhammad Afif Haider — NDC Cultural Club 2025' },
  { icon: Medal, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20', title: 'Club Representative', sub: 'Taharat Tasnim Raya — Frame the Moment Season 4, 2025' },
  { icon: Camera, color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', title: '20+ Event Covers', sub: 'Across Dhaka and beyond' },
  { icon: MapPin, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', title: 'Multiple Photowalks', sub: 'Conducted citywide across Dhaka' },
]

const moderators = [
  { name: 'Md Anwar Hossain', role: 'Head of Bangla Department', branch: 'Boys Branch' },
  { name: 'Ayesha Siddiqua', role: 'Lecturer, Biology Department', branch: 'Boys Branch' },
  { name: 'Shapan Kumar Sutradhar', role: 'Lecturer, Higher Mathematics Department', branch: 'Girls Branch' },
]

const stats = [
  { label: 'Years Active', value: '8+' },
  { label: 'Officially Recognised', value: '2024' },
  { label: 'Major Awards', value: '2' },
  { label: 'Events Covered', value: '20+' },
]

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white">
      <Navbar />

      {/* Page Header */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="inline-block mb-4 px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10"
          >
            <span className="text-amber-400 text-sm font-medium tracking-widest uppercase">Est. 2017</span>
          </motion.div>
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="font-cinzel text-4xl md:text-6xl font-bold mb-6 gradient-text"
          >
            About MUPC
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="text-gray-400 text-lg max-w-2xl mx-auto"
          >
            Monipur Uccha Biddayala Photography Club — capturing moments, preserving stories since 2017.
          </motion.p>
        </div>
      </section>

      {/* Stats Row */}
      <section className="py-12 bg-[#111118] border-y border-amber-500/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <motion.div
                key={s.label}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="text-center"
              >
                <div className="font-cinzel text-3xl md:text-4xl font-bold text-amber-400 mb-1">{s.value}</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Who We Are */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={0}
              variants={fadeUp}
            >
              <h2 className="font-cinzel text-3xl md:text-4xl font-bold mb-8 gradient-text">Who We Are</h2>
              <div className="space-y-4 text-gray-300 leading-relaxed text-[15px]">
                <p>
                  We are the official photography club of Monipur Uccha Biddayala and College, Mirpur, Dhaka —
                  founded in 2017 by Sifat Rahman under the Boys Branch. After the July Movement of 2024, we received
                  official college recognition and expanded our reach across both branches of the institution.
                </p>
                <p>
                  From our first session on video editing basics in the College Auditorium, to winning Best Club at NDC
                  9th National Cultural Jubilation 2025 and Best Club Partner at GSCPC Reflections 2.0 — MUPC has grown
                  into one of the most recognised student photography clubs in Dhaka. Our members have represented the
                  club at national competitions, conducted 20+ event covers, and organised multiple photowalks across the
                  city.
                </p>
                <p>
                  We run weekly photo contests, maintain a curated digital archive of our best work, and celebrate the
                  photographers who make it all possible.
                </p>
              </div>
            </motion.div>

            {/* Decorative film frames */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              custom={1}
              variants={fadeUp}
              className="relative hidden lg:block"
            >
              <div className="grid grid-cols-2 gap-4">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square bg-[#111118] border border-amber-500/10 rounded-xl flex items-center justify-center"
                    style={{ opacity: 1 - i * 0.15 }}
                  >
                    <Camera className="w-10 h-10 text-amber-500/20" />
                  </div>
                ))}
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent rounded-2xl pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Meet the Founder */}
      <section className="py-16 bg-[#111118] border-y border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="font-cinzel text-3xl font-bold text-center mb-12 gradient-text"
          >
            Meet the Founder
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="max-w-2xl mx-auto"
          >
            <div className="bg-[#0a0a0f] border border-amber-500/20 rounded-2xl p-8 text-center shadow-[0_0_40px_rgba(245,158,11,0.05)] card-hover">
              <div className="w-20 h-20 mx-auto bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mb-6">
                <Star className="w-10 h-10 text-amber-400" />
              </div>
              <h3 className="font-cinzel text-2xl font-bold text-white mb-1">Sifat Rahman</h3>
              <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-medium tracking-wider uppercase mb-4">
                Club Founder
              </div>
              <p className="text-gray-300 leading-relaxed">
                Actor who played the role of <span className="text-amber-400 font-medium">Shakil</span> in the drama{' '}
                <span className="text-amber-400 font-medium italic">Banalata Express</span>. Currently a student at
                the University of Dhaka (DU), Department of Film and Photography. Sifat founded MUPC in 2017 under
                Branch 1 (Boys), building the photography community from the ground up.
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Moderators */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="font-cinzel text-3xl font-bold text-center mb-4 gradient-text"
          >
            Club Moderators
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="text-center text-gray-400 mb-12"
          >
            Faculty members who guide and support the club
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {moderators.map((mod, i) => (
              <motion.div
                key={mod.name}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                custom={i}
                variants={fadeUp}
                className="bg-[#111118] border border-white/5 hover:border-amber-500/20 rounded-2xl p-7 card-hover transition-colors"
              >
                <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center mb-5">
                  <Users className="w-7 h-7 text-amber-400" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-1">{mod.name}</h3>
                <p className="text-amber-400 text-sm mb-3">{mod.role}</p>
                <span className="inline-block px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs text-gray-400">
                  {mod.branch}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="py-16 bg-[#111118] border-y border-amber-500/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="font-cinzel text-3xl font-bold text-center mb-4 gradient-text"
          >
            Our Achievements
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="text-center text-gray-400 mb-12"
          >
            Recognition earned through passion, craft, and community
          </motion.p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {achievements.map((ach, i) => {
              const Icon = ach.icon
              return (
                <motion.div
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  custom={i}
                  variants={fadeUp}
                  className={`border rounded-xl p-5 flex items-start gap-4 ${ach.bg} card-hover`}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <Icon className={`w-6 h-6 ${ach.color}`} />
                  </div>
                  <div>
                    <div className="font-semibold text-white text-sm mb-0.5">{ach.title}</div>
                    <div className="text-xs text-gray-400">{ach.sub}</div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* History Timeline — horizontal film strip */}
      <section className="py-24 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeUp}
            className="font-cinzel text-3xl font-bold text-center mb-4 gradient-text"
          >
            Our History
          </motion.h2>
          <motion.p
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            custom={1}
            variants={fadeUp}
            className="text-center text-gray-400 mb-16"
          >
            A journey of creativity, recognition, and growth
          </motion.p>

          {/* Film strip perforations top */}
          <div className="relative">
            <div className="flex gap-2 mb-2 overflow-hidden px-1">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-6 h-3 bg-amber-500/20 rounded-sm" />
              ))}
            </div>

            {/* Scrollable timeline */}
            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex gap-0 min-w-max">
                {timelineEvents.map((event, i) => (
                  <motion.div
                    key={i}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-50px' }}
                    custom={i * 0.5}
                    variants={fadeUp}
                    className="relative flex-shrink-0 w-64 bg-[#111118] border-r border-amber-500/10 p-6 first:rounded-l-xl last:rounded-r-xl last:border-r-0"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Calendar className="w-4 h-4 text-amber-500" />
                      <span className="font-cinzel text-amber-400 font-bold text-sm tracking-wider">{event.year}</span>
                    </div>
                    <h3 className="font-semibold text-white text-sm mb-3 leading-snug">{event.label}</h3>
                    <p className="text-gray-400 text-xs leading-relaxed">{event.description}</p>

                    {/* Connector dot */}
                    {i < timelineEvents.length - 1 && (
                      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-3 h-3 bg-amber-500 rounded-full z-10 border-2 border-[#0a0a0f]" />
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Film strip perforations bottom */}
            <div className="flex gap-2 mt-2 overflow-hidden px-1">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="flex-shrink-0 w-6 h-3 bg-amber-500/20 rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
