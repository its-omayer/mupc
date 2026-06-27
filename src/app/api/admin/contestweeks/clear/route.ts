import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import ContestWeek from '@/models/ContestWeek'
import Photo from '@/models/Photo'
import Vote from '@/models/Vote'
import AdminLog from '@/models/AdminLog'
import cloudinary from '@/lib/cloudinary'

export async function DELETE(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await connectToDatabase()

    // Find all contest-type photos (not gallery winners)
    const contestPhotos = await Photo.find({ type: 'contest' }).lean()

    // Delete from Cloudinary
    let deletedFromCloudinary = 0
    for (const photo of contestPhotos) {
      if (photo.cloudinaryPublicId) {
        try {
          await cloudinary.uploader.destroy(photo.cloudinaryPublicId as string)
          deletedFromCloudinary++
        } catch (err) {
          console.error(`Failed to delete ${photo.cloudinaryPublicId}:`, err)
        }
      }
    }

    // Delete all contest photos from DB
    await Photo.deleteMany({ type: 'contest' })

    // Delete all contest weeks
    const weekCount = await ContestWeek.countDocuments()
    await ContestWeek.deleteMany({})

    // Delete all votes
    await Vote.deleteMany({})

    await AdminLog.create({
      adminId: session.user.id,
      action: 'clear_all_contests',
      targetType: 'contestweek',
      targetId: 'all',
      details: `Cleared all ${weekCount} contest weeks, ${contestPhotos.length} contest photos (${deletedFromCloudinary} deleted from Cloudinary), and all votes.`,
    })

    return NextResponse.json({
      success: true,
      deletedWeeks: weekCount,
      deletedPhotos: contestPhotos.length,
      deletedFromCloudinary,
    })
  } catch (error) {
    console.error('[API /admin/contestweeks/clear]', error)
    return NextResponse.json({ error: 'Failed to clear contests' }, { status: 500 })
  }
}
