import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import User from '@/models/User'
import cloudinary from '@/lib/cloudinary'

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, bio, profilePhotoUrl, profilePhotoPublicId } = body

    if (!name || name.trim().length < 2 || name.trim().length > 60) {
      return NextResponse.json({ error: 'Name must be 2-60 characters' }, { status: 400 })
    }
    if (bio && bio.length > 300) {
      return NextResponse.json({ error: 'Bio max 300 characters' }, { status: 400 })
    }

    await connectToDatabase()
    const currentUser = await User.findById(session.user.id).select('profilePhotoPublicId')

    if (
      profilePhotoPublicId &&
      currentUser?.profilePhotoPublicId &&
      profilePhotoPublicId !== currentUser.profilePhotoPublicId
    ) {
      try {
        await cloudinary.uploader.destroy(currentUser.profilePhotoPublicId)
      } catch (err) {
        console.error('Failed to delete old profile photo:', err)
      }
    }

    const updated = await User.findByIdAndUpdate(
      session.user.id,
      {
        name: name.trim(),
        bio: bio || '',
        profilePhotoUrl: profilePhotoUrl || null,
        profilePhotoPublicId: profilePhotoPublicId || null,
      },
      { new: true }
    ).select('name bio email profilePhotoUrl profilePhotoPublicId badges').lean()

    return NextResponse.json(JSON.parse(JSON.stringify(updated)))
  } catch (error) {
    console.error('[API /dashboard/profile]', error)
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
  }
}
