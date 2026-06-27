import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import ContestWeek from '@/models/ContestWeek'
import Photo from '@/models/Photo'
import Vote from '@/models/Vote'
import Notification from '@/models/Notification'
import mongoose from 'mongoose'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { photoId } = body

    if (!photoId || !mongoose.Types.ObjectId.isValid(photoId)) {
      return NextResponse.json({ error: 'Invalid photoId' }, { status: 400 })
    }

    await connectToDatabase()
    const activeWeek = await ContestWeek.findOne({ isActive: true })
    if (!activeWeek) {
      return NextResponse.json({ error: 'No active contest' }, { status: 404 })
    }
    if (activeWeek.winnersSelected) {
      return NextResponse.json({ error: 'Contest has ended' }, { status: 400 })
    }

    const photo = await Photo.findOne({
      _id: photoId,
      status: 'approved',
      type: 'contest',
      contestWeek: activeWeek.weekId,
    })
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }

    const existingVote = await Vote.findOne({
      voterId: session.user.id,
      contestWeek: activeWeek.weekId,
      photoId,
    })
    if (existingVote) {
      return NextResponse.json({ error: 'Already voted' }, { status: 409 })
    }

    await Vote.create({ photoId, voterId: session.user.id, contestWeek: activeWeek.weekId })
    const updatedPhoto = await Photo.findByIdAndUpdate(
      photoId,
      { $inc: { votes: 1 } },
      { new: true }
    )
    await ContestWeek.findByIdAndUpdate(activeWeek._id, { $inc: { totalVotes: 1 } })

    if (updatedPhoto && updatedPhoto.votes === 50) {
      await Notification.create({
        userId: updatedPhoto.uploadedBy,
        type: 'vote_milestone',
        message: `Your photo "${updatedPhoto.title}" has reached 50 votes!`,
        photoId: updatedPhoto._id,
      })
    }

    return NextResponse.json({ votes: updatedPhoto?.votes, success: true })
  } catch (error) {
    console.error('[API /contest/vote]', error)
    return NextResponse.json({ error: 'Failed to vote' }, { status: 500 })
  }
}
