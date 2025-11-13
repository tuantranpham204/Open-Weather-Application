import { NextResponse } from 'next/server'
import { createUser } from '@/lib/user-store'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body
    if (!email || !password) return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })

    const user = createUser(email, password)
    if (!user) return NextResponse.json({ error: 'User already exists' }, { status: 409 })

    // In a real app set a secure cookie / JWT here. For the prototype return user id only.
    return NextResponse.json({ id: user.id, email: user.email })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}
