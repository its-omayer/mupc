import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Photo from '@/models/Photo'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const week = searchParams.get('week')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20

    const filter: Record<string, unknown> = {}
    if (status) filter.status = status
    if (week) filter.contestWeek = week

    const total = await Photo.countDocuments(filter)
    const photos = await Photo.find(filter)
      .sort({ uploadedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()

    return NextResponse.json({
      photos: JSON.parse(JSON.stringify(photos)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[API /admin/photos]', error)
    return NextResponse.json({ error: 'Failed to fetch photos' }, { status: 500 })
  }
}
