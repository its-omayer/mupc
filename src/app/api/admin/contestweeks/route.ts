import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import ContestWeek from '@/models/ContestWeek'
import AdminLog from '@/models/AdminLog'
import { getYear, getISOWeek } from 'date-fns'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await connectToDatabase()
    const contestWeeks = await ContestWeek.find({}).sort({ createdAt: -1 }).lean()
    return NextResponse.json({ contestWeeks: JSON.parse(JSON.stringify(contestWeeks)) })
  } catch (error) {
    console.error('[API /admin/contestweeks GET]', error)
    return NextResponse.json({ error: 'Failed to fetch contest weeks' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    const body = await request.json()
    const { endDate } = body

    if (!endDate || new Date(endDate) <= new Date()) {
      return NextResponse.json({ error: 'End date must be in the future' }, { status: 400 })
    }

    await connectToDatabase()
    const date = new Date(endDate)
    const year = getYear(date)
    const week = getISOWeek(date)
    const weekId = `${year}-W${String(week).padStart(2, '0')}`

    const existing = await ContestWeek.findOne({ weekId })
    if (existing) {
      return NextResponse.json({ error: 'Week already exists' }, { status: 409 })
    }

    await ContestWeek.updateMany({ isActive: true }, { isActive: false })
    const newWeek = await ContestWeek.create({ weekId, endDate: date, isActive: true })

    await AdminLog.create({
      adminId: session.user.id,
      action: 'create_contest_week',
      targetType: 'contestweek',
      targetId: newWeek._id,
      details: `Created contest week ${weekId}`,
    })

    return NextResponse.json({ contestWeek: JSON.parse(JSON.stringify(newWeek)) })
  } catch (error) {
    console.error('[API /admin/contestweeks POST]', error)
    return NextResponse.json({ error: 'Failed to create contest week' }, { status: 500 })
  }
}
