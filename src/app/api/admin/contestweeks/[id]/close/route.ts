import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import ContestWeek from '@/models/ContestWeek'
import Photo from '@/models/Photo'
import Photographer from '@/models/Photographer'
import User from '@/models/User'
import Notification from '@/models/Notification'
import AdminLog from '@/models/AdminLog'
import cloudinary from '@/lib/cloudinary'
import mongoose from 'mongoose'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    await connectToDatabase()
    const contestWeek = await ContestWeek.findById(params.id)
    if (!contestWeek) return NextResponse.json({ error: 'Contest week not found' }, { status: 404 })
    if (contestWeek.winnersSelected) {
      return NextResponse.json({ error: 'Already closed' }, { status: 400 })
    }

    // Get top 3 winners by votes among approved photos
    const allContestPhotos = await Photo.find({
      type: 'contest',
      contestWeek: contestWeek.weekId,
    }).sort({ votes: -1 })

    const approvedPhotos = allContestPhotos.filter(p => p.status === 'approved')
    const winners = approvedPhotos.slice(0, 3)
    const winnerIds = new Set(winners.map(w => w._id.toString()))

    const badgeMap: Record<number, string> = {
      1: 'golden_frame',
      2: 'silver_shutter',
      3: 'bronze_lens',
    }
    const rankLabel: Record<number, string> = { 1: '1st', 2: '2nd', 3: '3rd' }

    // Process winners — promote to gallery
    const winnersData = []
    for (let i = 0; i < winners.length; i++) {
      const winner = winners[i]
      const weekRank = i + 1

      await Photo.findByIdAndUpdate(winner._id, { type: 'gallery', weekRank })
      await Photographer.findOneAndUpdate(
        { name: winner.photographerName },
        {
          $inc: { wins: 1 },
          $set: { bestPhotoUrl: winner.cloudinaryUrl, bestPhotoPublicId: winner.cloudinaryPublicId },
        },
        { upsert: true, new: true }
      )

      const badge = badgeMap[weekRank]
      if (badge) {
        await User.findByIdAndUpdate(winner.uploadedBy, { $addToSet: { badges: badge } })
      }

      await Notification.create({
        userId: winner.uploadedBy,
        type: 'contest_won',
        message: `🏆 Your photo "${winner.title}" placed ${rankLabel[weekRank]} in ${contestWeek.weekId}! Congratulations!`,
        photoId: winner._id,
      })

      winnersData.push({ ...winner.toObject(), weekRank })
    }

    // Delete all non-winning photos from Cloudinary + DB to save storage
    const losers = allContestPhotos.filter(p => !winnerIds.has(p._id.toString()))
    for (const photo of losers) {
      if (photo.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(photo.cloudinaryPublicId)
        } catch (err) {
          console.error(`Failed to delete Cloudinary asset ${photo.cloudinaryPublicId}:`, err)
        }
      }
      await Photo.findByIdAndDelete(photo._id)
    }

    await ContestWeek.findByIdAndUpdate(params.id, {
      winnersSelected: true,
      isActive: false,
    })

    await AdminLog.create({
      adminId: session.user.id,
      action: 'close_contest_week',
      targetType: 'contestweek',
      targetId: params.id,
      details: `Closed ${contestWeek.weekId}. Winners: ${winners.map(w => w.title).join(', ')}. Deleted ${losers.length} non-winning photos from Cloudinary.`,
    })

    return NextResponse.json({
      success: true,
      winners: JSON.parse(JSON.stringify(winnersData)),
      deletedCount: losers.length,
    })
  } catch (error) {
    console.error('[API /admin/contestweeks/close]', error)
    return NextResponse.json({ error: 'Failed to close contest week' }, { status: 500 })
  }
}
