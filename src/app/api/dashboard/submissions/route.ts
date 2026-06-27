import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import Photo from '@/models/Photo'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    await connectToDatabase()
    const submissions = await Photo.find({ uploadedBy: session.user.id })
      .sort({ uploadedAt: -1 })
      .lean()
    return NextResponse.json({ submissions: JSON.parse(JSON.stringify(submissions)) })
  } catch (error) {
    console.error('[API /dashboard/submissions]', error)
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 })
  }
}
