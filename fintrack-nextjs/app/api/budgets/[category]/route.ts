import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/backend/lib/prisma'
import { getCurrentUser } from '@/backend/lib/auth'

// DELETE a single budget by category
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ category: string }> }
) {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { category } = await params
    const decodedCategory = decodeURIComponent(category)

    // Verify the budget belongs to the user
    const existing = await prisma.budget.findUnique({
      where: {
        userId_category: {
          userId: authUser.userId,
          category: decodedCategory
        }
      }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Budget not found' }, { status: 404 })
    }

    await prisma.budget.delete({
      where: {
        userId_category: {
          userId: authUser.userId,
          category: decodedCategory
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete budget error:', error)
    return NextResponse.json({ error: 'Failed to delete budget' }, { status: 500 })
  }
}
