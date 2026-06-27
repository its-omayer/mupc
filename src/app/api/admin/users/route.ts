import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Photo from '@/models/Photo'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await connectToDatabase()
    const users = await User.find({}).select('-password').sort({ createdAt: -1 }).lean()
    const usersWithCount = await Promise.all(
      users.map(async (user: any) => {
        const photoCount = await Photo.countDocuments({ uploadedBy: user._id })
        return { ...user, photoCount }
      })
    )
    return NextResponse.json({ users: JSON.parse(JSON.stringify(usersWithCount)) })
  } catch (error) {
    console.error('[API /admin/users]', error)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
