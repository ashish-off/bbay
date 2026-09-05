import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

// GET /api/admin/dashboard — Admin only
export async function GET() {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    if (!isAdmin(user.email)) {
        return Response.json({ error: 'Admin only' }, { status: 403 })
    }

    const [totalListings, activeAuctions, totalTransactions, revenue, recentOrders] = await Promise.all([
        prisma.listing.count(),
        prisma.listing.count({
            where: { listingType: 'AUCTION', status: 'ACTIVE' },
        }),
        prisma.order.count(),
        prisma.order.aggregate({ _sum: { total: true } }),
        prisma.order.findMany({
            orderBy: { createdAt: 'desc' },
            take: 50,
            select: { id: true, total: true, status: true, createdAt: true },
        }),
    ])

    return Response.json({
        totalListings,
        activeAuctions,
        totalTransactions,
        revenue: revenue._sum.total || 0,
        allOrders: recentOrders,
    })
}
