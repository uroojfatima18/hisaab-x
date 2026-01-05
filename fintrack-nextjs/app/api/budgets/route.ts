import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/backend/lib/prisma'
import { getCurrentUser } from '@/backend/lib/auth'

// GET all budgets for the current user
export async function GET() {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const budgets = await prisma.budget.findMany({
      where: { userId: authUser.userId },
      orderBy: { category: 'asc' }
    })

    return NextResponse.json({ budgets })
  } catch (error) {
    console.error('Get budgets error:', error)
    return NextResponse.json({ error: 'Failed to get budgets' }, { status: 500 })
  }
}

// POST create or update a budget (upsert)
export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { category, limit, yearlyLimit } = body

    if (!category || limit === undefined) {
      return NextResponse.json({ error: 'Category and limit are required' }, { status: 400 })
    }

    // Upsert: create or update based on userId + category
    const budget = await prisma.budget.upsert({
      where: {
        userId_category: {
          userId: authUser.userId,
          category
        }
      },
      update: {
        limit: Math.round(limit),
        yearlyLimit: yearlyLimit ? Math.round(yearlyLimit) : null
      },
      create: {
        userId: authUser.userId,
        category,
        limit: Math.round(limit),
        yearlyLimit: yearlyLimit ? Math.round(yearlyLimit) : null
      }
    })

    return NextResponse.json({ budget })
  } catch (error) {
    console.error('Create/update budget error:', error)
    return NextResponse.json({ error: 'Failed to save budget' }, { status: 500 })
  }
}

// DELETE all budgets for the current user
export async function DELETE() {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await prisma.budget.deleteMany({
      where: { userId: authUser.userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete all budgets error:', error)
    return NextResponse.json({ error: 'Failed to delete budgets' }, { status: 500 })
  }
}
