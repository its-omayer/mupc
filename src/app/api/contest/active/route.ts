import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import ContestWeek from '@/models/ContestWeek'

export async function GET() {
  try {
    await connectToDatabase()
    const activeWeek = await ContestWeek.findOne({ isActive: true }).lean()
    if (!activeWeek) {
      return NextResponse.json({ activeWeek: null })
    }
    return NextResponse.json({ activeWeek: JSON.parse(JSON.stringify(activeWeek)) })
  } catch (error) {
    console.error('[API /contest/active]', error)
    return NextResponse.json({ error: 'Failed to fetch active week' }, { status: 500 })
  }
}
