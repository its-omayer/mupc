import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Photo from '@/models/Photo'
import mongoose from 'mongoose'

export async function PATCH(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }
    await connectToDatabase()
    await Photo.findByIdAndUpdate(params.id, { $inc: { views: 1 } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API /photos/view]', error)
    return NextResponse.json({ error: 'Failed to update views' }, { status: 500 })
  }
}
