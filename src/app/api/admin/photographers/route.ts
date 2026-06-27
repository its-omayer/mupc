import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Photographer from '@/models/Photographer'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await connectToDatabase()
    const photographers = await Photographer.find({}).sort({ wins: -1 }).lean()
    return NextResponse.json({ photographers: JSON.parse(JSON.stringify(photographers)) })
  } catch (error) {
    console.error('[API /admin/photographers GET]', error)
    return NextResponse.json({ error: 'Failed to fetch photographers' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await request.json()
    const { name, bio, bestPhotoUrl, bestPhotoPublicId, userId } = body

    if (!name) return NextResponse.json({ error: 'Name is required' }, { status: 400 })

    await connectToDatabase()
    const existing = await Photographer.findOne({ name })
    if (existing) return NextResponse.json({ error: 'Photographer already exists' }, { status: 409 })

    const photographer = await Photographer.create({ name, bio, bestPhotoUrl, bestPhotoPublicId, userId: userId || null })
    return NextResponse.json({ photographer: JSON.parse(JSON.stringify(photographer)) })
  } catch (error) {
    console.error('[API /admin/photographers POST]', error)
    return NextResponse.json({ error: 'Failed to create photographer' }, { status: 500 })
  }
}
