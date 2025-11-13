import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  // In production revoke session / clear cookie. Here just return success.
  return NextResponse.json({ ok: true })
}
