import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Notification from '@/models/Notification'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const notifications = await Notification.find({ userId: session.user.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean()
    const unreadCount = notifications.filter((n: any) => !n.read).length
    return NextResponse.json({
      notifications: JSON.parse(JSON.stringify(notifications)),
      unreadCount,
    })
  } catch (error) {
    console.error('[API /notifications]', error)
    return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 })
  }
}
