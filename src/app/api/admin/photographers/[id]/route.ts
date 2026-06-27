import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Photographer from '@/models/Photographer'
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
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }
    const body = await request.json()
    const { bio, bestPhotoUrl, bestPhotoPublicId, name } = body

    await connectToDatabase()
    const current = await Photographer.findById(params.id)
    if (!current) return NextResponse.json({ error: 'Photographer not found' }, { status: 404 })

    if (bestPhotoPublicId && bestPhotoPublicId !== current.bestPhotoPublicId && current.bestPhotoPublicId) {
      try { await cloudinary.uploader.destroy(current.bestPhotoPublicId) }
      catch (err) { console.error('Failed to delete old photographer photo:', err) }
    }

    const updates: Record<string, unknown> = {}
    if (bio !== undefined) updates.bio = bio
    if (bestPhotoUrl !== undefined) updates.bestPhotoUrl = bestPhotoUrl
    if (bestPhotoPublicId !== undefined) updates.bestPhotoPublicId = bestPhotoPublicId
    if (name !== undefined) updates.name = name

    await Photographer.findByIdAndUpdate(params.id, updates)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API /admin/photographers PATCH]', error)
    return NextResponse.json({ error: 'Failed to update photographer' }, { status: 500 })
  }
}
