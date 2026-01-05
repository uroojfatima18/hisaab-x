import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/backend/lib/prisma'
import { getCurrentUser } from '@/backend/lib/auth'

// GET a single transaction
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params

    const transaction = await prisma.transaction.findFirst({
      where: { id, userId: authUser.userId }
    })

    if (!transaction) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Get transaction error:', error)
    return NextResponse.json({ error: 'Failed to get transaction' }, { status: 500 })
  }
}

// PUT update a transaction
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { date, type, category, description, amountPaisa } = body

    // Verify the transaction belongs to the user
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: authUser.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    const transaction = await prisma.transaction.update({
      where: { id },
      data: {
        ...(date && { date: new Date(date) }),
        ...(type && { type }),
        ...(category && { category }),
        ...(description && { description }),
        ...(amountPaisa !== undefined && { amountPaisa: Math.round(amountPaisa) })
      }
    })

    return NextResponse.json({ transaction })
  } catch (error) {
    console.error('Update transaction error:', error)
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 })
  }
}

// DELETE a single transaction
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authUser = await getCurrentUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { id } = await params

    // Verify the transaction belongs to the user
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: authUser.userId }
    })

    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 })
    }

    await prisma.transaction.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete transaction error:', error)
    return NextResponse.json({ error: 'Failed to delete transaction' }, { status: 500 })
  }
}
