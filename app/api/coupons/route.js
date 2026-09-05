import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

// GET /api/coupons — Public coupons or all (admin)
export async function GET() {
    const authResult = await getAuthUser(false)

    let where = { isPublic: true }
    if (authResult?.user && isAdmin(authResult.user.email)) {
        where = {} // Admin sees all
    }

    const coupons = await prisma.coupon.findMany({
        where,
        orderBy: { createdAt: 'desc' },
    })

    return Response.json(coupons)
}

// POST /api/coupons — Admin only
export async function POST(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    if (!isAdmin(user.email)) {
        return Response.json({ error: 'Admin only' }, { status: 403 })
    }

    const body = await request.json()
    const { code, description, discount, forNewUser, forMember, isPublic, expiresAt } = body

    if (!code || !description || !discount || !expiresAt) {
        return Response.json({ error: 'code, description, discount, expiresAt required' }, { status: 400 })
    }

    const coupon = await prisma.coupon.create({
        data: {
            code: code.toUpperCase(),
            description,
            discount: parseFloat(discount),
            forNewUser: forNewUser || false,
            forMember: forMember || false,
            isPublic: isPublic || false,
            expiresAt: new Date(expiresAt),
        },
    })

    return Response.json(coupon, { status: 201 })
}
