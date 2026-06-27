import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import ContestWeek from '@/models/ContestWeek'
import Photo from '@/models/Photo'
import User from '@/models/User'
import Notification from '@/models/Notification'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    if (session.user.role === 'viewer') {
      return NextResponse.json({ error: 'Upgrade to member to submit' }, { status: 403 })
    }

    const body = await request.json()
    const { cloudinaryPublicId, cloudinaryUrl, title, tags } = body

    if (!cloudinaryPublicId || !cloudinaryUrl || !title) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    const trimmedTitle = title.trim()
    if (trimmedTitle.length < 3 || trimmedTitle.length > 100) {
      return NextResponse.json({ error: 'Title must be 3-100 characters' }, { status: 400 })
    }
    if (tags && (!Array.isArray(tags) || tags.length > 3)) {
      return NextResponse.json({ error: 'Max 3 tags allowed' }, { status: 400 })
    }

    await connectToDatabase()
    const activeWeek = await ContestWeek.findOne({ isActive: true })
    if (!activeWeek) {
      return NextResponse.json({ error: 'No active contest' }, { status: 404 })
    }
    if (activeWeek.winnersSelected) {
      return NextResponse.json({ error: 'Contest is closed' }, { status: 400 })
    }

    const user = await User.findById(session.user.id).select('name')
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const existing = await Photo.findOne({
      uploadedBy: session.user.id,
      contestWeek: activeWeek.weekId,
      type: 'contest',
    })
    if (existing) {
      return NextResponse.json({ error: 'You already submitted a photo this week' }, { status: 409 })
    }

    const photo = await Photo.create({
      cloudinaryPublicId,
      cloudinaryUrl,
      title: trimmedTitle,
      photographerName: user.name,
      uploadedBy: session.user.id,
      type: 'contest',
      contestWeek: activeWeek.weekId,
      status: 'pending',
      tags: tags || [],
    })

    await ContestWeek.findByIdAndUpdate(activeWeek._id, { $inc: { totalPhotos: 1 } })

    const userDoc = await User.findById(session.user.id)
    if (userDoc && !userDoc.badges.includes('first_upload')) {
      await User.findByIdAndUpdate(session.user.id, { $addToSet: { badges: 'first_upload' } })
      await Notification.create({
        userId: session.user.id,
        type: 'badge_earned',
        message: 'You earned the "First Upload" badge!',
      })
    }

    await Notification.create({
      userId: session.user.id,
      type: 'photo_approved',
      message: `Your photo "${trimmedTitle}" was submitted and is pending review.`,
      photoId: photo._id,
    })

    return NextResponse.json({ success: true, photo: JSON.parse(JSON.stringify(photo)) })
  } catch (error) {
    console.error('[API /contest/submit]', error)
    return NextResponse.json({ error: 'Failed to submit photo' }, { status: 500 })
  }
}
