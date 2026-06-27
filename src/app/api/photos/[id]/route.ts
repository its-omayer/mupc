import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Photo from '@/models/Photo'
import mongoose from 'mongoose'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    if (!mongoose.Types.ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid id' }, { status: 400 })
    }
    await connectToDatabase()
    const photo = await Photo.findById(params.id).lean()
    if (!photo) {
      return NextResponse.json({ error: 'Photo not found' }, { status: 404 })
    }
    return NextResponse.json(JSON.parse(JSON.stringify(photo)))
  } catch (error) {
    console.error('[API /photos/[id]]', error)
    return NextResponse.json({ error: 'Failed to fetch photo' }, { status: 500 })
  }
}
