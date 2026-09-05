import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// POST /api/coupons/validate — Auth required
export async function POST(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { code } = await request.json()

    if (!code) {
        return Response.json({ error: 'code required' }, { status: 400 })
    }

    const coupon = await prisma.coupon.findUnique({
        where: { code: code.toUpperCase() },
    })

    if (!coupon) {
        return Response.json({ error: 'Invalid coupon code' }, { status: 404 })
    }

    if (new Date(coupon.expiresAt) < new Date()) {
        return Response.json({ error: 'Coupon has expired' }, { status: 400 })
    }

    return Response.json({
        valid: true,
        code: coupon.code,
        discount: coupon.discount,
        description: coupon.description,
    })
}
