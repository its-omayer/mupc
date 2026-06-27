import { NextRequest, NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Photo from '@/models/Photo'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const photographer = searchParams.get('photographer')
    const tag = searchParams.get('tag')

    const filter: Record<string, unknown> = { type: 'gallery', status: 'approved' }
    if (photographer) filter.photographerName = photographer
    if (tag) filter.tags = tag

    const photos = await Photo.find(filter)
      .sort({ contestWeek: -1, weekRank: 1 })
      .lean()

    return NextResponse.json({ photos: JSON.parse(JSON.stringify(photos)) })
  } catch (error) {
    console.error('[API /gallery]', error)
    return NextResponse.json({ error: 'Failed to fetch gallery' }, { status: 500 })
  }
}
