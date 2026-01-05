import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/backend/lib/prisma'
import { getCurrentUser } from '@/backend/lib/auth'

// GET user settings
export async function GET() {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const settings = await prisma.userSettings.findUnique({
      where: { userId: authUser.userId }
    })

    if (!settings) {
      return NextResponse.json({ error: 'Settings not found' }, { status: 404 })
    }

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Get settings error:', error)
    return NextResponse.json({ error: 'Failed to get settings' }, { status: 500 })
  }
}

// PUT update user settings
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { currency, symbol, setupComplete, initialBalance } = body

    const settings = await prisma.userSettings.update({
      where: { userId: authUser.userId },
      data: {
        ...(currency !== undefined && { currency }),
        ...(symbol !== undefined && { symbol }),
        ...(setupComplete !== undefined && { setupComplete }),
        ...(initialBalance !== undefined && { initialBalance: Math.round(initialBalance) })
      }
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
