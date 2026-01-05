import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/backend/lib/prisma'
import { hashPassword, createToken, setAuthCookie } from '@/backend/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, email, password } = body

    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'Username, email and password are required' },
        { status: 400 }
      )
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already taken' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Hash password and create user
    const hashedPassword = await hashPassword(password)

    // Generate avatar URL
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(username)}`

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        avatarUrl,
        settings: {
          create: {
            currency: 'USD',
            symbol: '$',
            setupComplete: false,
            initialBalance: 0
          }
        }
      },
      include: {
        settings: true
      }
    })

    // Create and set auth token
    const token = await createToken({ userId: user.id, username: user.username })
    await setAuthCookie(token)

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
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to create account' },
      { status: 500 }
    )
  }
}
