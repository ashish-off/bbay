import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

// GET /api/admin/users — Admin only, list all users with stats
export async function GET() {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    if (!isAdmin(user.email)) {
        return Response.json({ error: 'Admin only' }, { status: 403 })
    }

    const users = await prisma.user.findMany({
        orderBy: { id: 'asc' },
        include: {
            _count: {
                select: {
                    listings: true,
                    buyerOrders: true,
                    sellerOrders: true,
                    bids: true,
                },
            },
        },
    })

    return Response.json(users)
}
