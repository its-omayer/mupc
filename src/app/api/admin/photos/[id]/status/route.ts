import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Photo from '@/models/Photo'
import Notification from '@/models/Notification'
import AdminLog from '@/models/AdminLog'
import mongoose from 'mongoose'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await request.json()
    const { status } = body
    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }
    await connectToDatabase()
    const photo = await Photo.findById(params.id)
    if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

    photo.status = status
    await photo.save()

    const message =
      status === 'approved'
        ? `Your photo "${photo.title}" was approved and is now live!`
        : `Your photo "${photo.title}" was not approved this round.`
    await Notification.create({
      userId: photo.uploadedBy,
      type: status === 'approved' ? 'photo_approved' : 'photo_rejected',
      message,
      photoId: photo._id,
    })

    await AdminLog.create({
      adminId: session.user.id,
      action: `photo_${status}`,
      targetType: 'photo',
      targetId: photo._id,
      details: `Photo "${photo.title}" ${status}`,
    })

    return NextResponse.json({ success: true, photo: JSON.parse(JSON.stringify(photo)) })
  } catch (error) {
    console.error('[API /admin/photos/status]', error)
    return NextResponse.json({ error: 'Failed to update photo status' }, { status: 500 })
  }
}
