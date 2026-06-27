import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { photoId, action = 'save' } = body

    if (!photoId || !mongoose.Types.ObjectId.isValid(photoId)) {
      return NextResponse.json({ error: 'Invalid photoId' }, { status: 400 })
    }
    if (!['save', 'unsave'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    await connectToDatabase()
    if (action === 'save') {
      await User.findByIdAndUpdate(session.user.id, { $addToSet: { savedPhotos: photoId } })
    } else {
      await User.findByIdAndUpdate(session.user.id, { $pull: { savedPhotos: photoId } })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API /bookmarks]', error)
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 })
  }
}
