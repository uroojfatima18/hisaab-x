import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/backend/lib/prisma'
import { getCurrentUser } from '@/backend/lib/auth'

// GET all transactions for the current user
export async function GET() {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const transactions = await prisma.transaction.findMany({
      where: { userId: authUser.userId },
      orderBy: { date: 'desc' }
    })

    return NextResponse.json({ transactions })
  } catch (error) {
    console.error('Get transactions error:', error)
    return NextResponse.json({ error: 'Failed to get transactions' }, { status: 500 })
  }
}

// POST create a new transaction
export async function POST(request: NextRequest) {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const body = await request.json()
    const { date, type, category, description, amountPaisa } = body

    if (!date || !type || !category || !description || amountPaisa === undefined) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId: authUser.userId,
        date: new Date(date),
        type,
        category,
        description,
        amountPaisa: Math.round(amountPaisa)
      }
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Create transaction error:', error)
    return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 })
  }
}

// DELETE all transactions for the current user
export async function DELETE() {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    await prisma.transaction.deleteMany({
      where: { userId: authUser.userId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete all transactions error:', error)
    return NextResponse.json({ error: 'Failed to delete transactions' }, { status: 500 })
  }
}
