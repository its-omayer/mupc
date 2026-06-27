import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { connectToDatabase } from '@/lib/mongodb'
import AdminLog from '@/models/AdminLog'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    await connectToDatabase()
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 30

    const total = await AdminLog.countDocuments()
    const logs = await AdminLog.find({})
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('adminId', 'name email')
      .lean()

    return NextResponse.json({
      logs: JSON.parse(JSON.stringify(logs)),
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    console.error('[API /admin/logs]', error)
    return NextResponse.json({ error: 'Failed to fetch logs' }, { status: 500 })
  }
}
