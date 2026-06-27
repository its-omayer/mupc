import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Notification from '@/models/Notification'

export async function PATCH() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    await Notification.updateMany(
      { userId: session.user.id, read: false },
      { $set: { read: true } }
    )
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API /notifications/mark-all-read]', error)
    return NextResponse.json({ error: 'Failed to update notifications' }, { status: 500 })
  }
}
