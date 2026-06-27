import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import ContestWeek from '@/models/ContestWeek'
import Photo from '@/models/Photo'

export async function GET() {
  try {
    await connectToDatabase()
    const activeWeek = await ContestWeek.findOne({ isActive: true }).lean()
    if (!activeWeek) {
      return NextResponse.json({ photos: [], activeWeek: null })
    }
    const photos = await Photo.find({
      type: 'contest',
      contestWeek: (activeWeek as any).weekId,
      status: 'approved',
    })
      .sort({ votes: -1 })
      .lean()

    return NextResponse.json({
      photos: JSON.parse(JSON.stringify(photos)),
      activeWeek: JSON.parse(JSON.stringify(activeWeek)),
    })
  } catch (error) {
    console.error('[API /contest/photos]', error)
    return NextResponse.json({ error: 'Failed to fetch contest photos' }, { status: 500 })
  }
}
