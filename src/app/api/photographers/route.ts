import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/lib/mongodb'
import Photographer from '@/models/Photographer'

export async function GET() {
  try {
    await connectToDatabase()
    const photographers = await Photographer.find({}).sort({ wins: -1 }).lean()
    return NextResponse.json({ photographers: JSON.parse(JSON.stringify(photographers)) })
  } catch (error) {
    console.error('[API /photographers]', error)
    return NextResponse.json({ error: 'Failed to fetch photographers' }, { status: 500 })
  }
}
