import { NextResponse } from 'next/server'
import { authenticateUser } from '@/lib/user-store'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body
    if (!email || !password) return NextResponse.json({ error: 'Missing email or password' }, { status: 400 })

    const user = authenticateUser(email, password)
    if (!user) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 })

    // For prototype: return a minimal session object. In production return JWT or set cookie.
    return NextResponse.json({ id: user.id, email: user.email })
  } catch (err) {
    return NextResponse.json({ error: 'Failed to login' }, { status: 500 })
  }
}
