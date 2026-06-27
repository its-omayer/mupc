import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Photo from '@/models/Photo'
import AdminLog from '@/models/AdminLog'
import cloudinary from '@/lib/cloudinary'
import mongoose from 'mongoose'

export async function DELETE(
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
    const photo = await Photo.findById(params.id)
    if (!photo) return NextResponse.json({ error: 'Photo not found' }, { status: 404 })

    try {
      await cloudinary.uploader.destroy(photo.cloudinaryPublicId)
    } catch (err) {
      console.error('Failed to delete from Cloudinary:', err)
    }

    await Photo.findByIdAndDelete(params.id)
    await AdminLog.create({
      adminId: session.user.id,
      action: 'delete_photo',
      targetType: 'photo',
      targetId: photo._id,
      details: `Deleted photo "${photo.title}"`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API /admin/photos DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete photo' }, { status: 500 })
  }
}
