import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/backend/lib/prisma'
import { getCurrentUser } from '@/backend/lib/auth'

// GET current user profile
export async function GET() {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      include: { settings: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        settings: user.settings
      }
    })
  } catch (error) {
    console.error('Get user error:', error)
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 })
  }
}

// PUT update user profile (avatar, email)
export async function PUT(request: NextRequest) {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { avatarUrl, email } = body

    // If email is being updated, check it's not already in use
    if (email) {
      const existingEmail = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: authUser.userId }
        }
      })

      if (existingEmail) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 })
      }
    }

    const user = await prisma.user.update({
      where: { id: authUser.userId },
      data: {
        ...(avatarUrl !== undefined && { avatarUrl }),
        ...(email !== undefined && { email })
      },
      include: { settings: true }
    })

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatarUrl: user.avatarUrl,
        settings: user.settings
      }
    })
  } catch (error) {
    console.error('Update user error:', error)
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 })
  }
}

// DELETE user account and all associated data
export async function DELETE() {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    // Delete user (cascades to settings, transactions, budgets)
    await prisma.user.delete({
      where: { id: authUser.userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
