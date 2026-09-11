import { NextResponse } from 'next/server'

// GET /api/esewa/failure — eSewa redirects here on failure/cancel
export async function GET() {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    // Redirect to cart with failure message
    return NextResponse.redirect(`${baseUrl}/cart?payment=failed`)
}
