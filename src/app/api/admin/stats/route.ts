import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Photo from '@/models/Photo'
import ContestWeek from '@/models/ContestWeek'
import Vote from '@/models/Vote'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await connectToDatabase()
    const [totalMembers, pendingPhotos, approvedContestPhotos, activeWeek, totalVotes] =
      await Promise.all([
        User.countDocuments({ role: { $ne: 'admin' } }),
        Photo.countDocuments({ status: 'pending' }),
        Photo.countDocuments({ type: 'contest', status: 'approved' }),
        ContestWeek.findOne({ isActive: true }).lean(),
        Vote.countDocuments(),
      ])
    return NextResponse.json({
      totalMembers,
      pendingPhotos,
      approvedContestPhotos,
      activeWeek: activeWeek ? JSON.parse(JSON.stringify(activeWeek)) : null,
      totalVotes,
    })
  } catch (error) {
    console.error('[API /admin/stats]', error)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
