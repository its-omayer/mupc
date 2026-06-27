import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import Photo from '@/models/Photo'
import Vote from '@/models/Vote'
import Notification from '@/models/Notification'
import Photographer from '@/models/Photographer'
import AdminLog from '@/models/AdminLog'
import cloudinary from '@/lib/cloudinary'
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
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot modify your own account' }, { status: 400 })
    }
    const body = await request.json()
    const { role, isActive } = body

    await connectToDatabase()
    const targetUser = await User.findById(params.id)
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (role && role !== 'admin' && targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot demote the last admin' }, { status: 400 })
      }
    }

    const updates: Record<string, unknown> = {}
    if (role !== undefined) updates.role = role
    if (isActive !== undefined) updates.isActive = isActive

    await User.findByIdAndUpdate(params.id, updates)
    await AdminLog.create({
      adminId: session.user.id,
      action: 'update_user',
      targetType: 'user',
      targetId: params.id,
      details: `Updated user ${targetUser.email}: ${JSON.stringify(updates)}`,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API /admin/users PATCH]', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (params.id === session.user.id) {
      return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 })
    }
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }

    await connectToDatabase()
    const targetUser = await User.findById(params.id)
    if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    if (targetUser.role === 'admin') {
      const adminCount = await User.countDocuments({ role: 'admin' })
      if (adminCount <= 1) {
        return NextResponse.json({ error: 'Cannot delete the last admin' }, { status: 400 })
      }
    }

    const userPhotos = await Photo.find({ uploadedBy: params.id }).select('cloudinaryPublicId').lean()
    await Promise.all(
      userPhotos.map(async (photo: any) => {
        try { await cloudinary.uploader.destroy(photo.cloudinaryPublicId) }
        catch (err) { console.error(`Failed to delete Cloudinary image ${photo.cloudinaryPublicId}:`, err) }
      })
    )

    if (targetUser.profilePhotoPublicId) {
      try { await cloudinary.uploader.destroy(targetUser.profilePhotoPublicId) }
      catch (err) { console.error('Failed to delete profile photo:', err) }
    }

    await Photo.deleteMany({ uploadedBy: params.id })
    await Vote.deleteMany({ voterId: params.id })
    await Notification.deleteMany({ userId: params.id })
    const photographerDeleted = await Photographer.findOneAndDelete({ userId: params.id })
    await User.findByIdAndDelete(params.id)

    await AdminLog.create({
      adminId: session.user.id,
      action: 'delete_user',
      targetType: 'user',
      targetId: params.id,
      details: `Deleted user ${targetUser.email}. Photos deleted: ${userPhotos.length}. Photographer profile deleted: ${!!photographerDeleted}`,
    })

    return NextResponse.json({
      success: true,
      deletedPhotos: userPhotos.length,
      photographerDeleted: !!photographerDeleted,
      message: 'User and all associated data deleted successfully',
    })
  } catch (error) {
    console.error('[API /admin/users DELETE]', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
