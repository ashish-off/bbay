import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/seller/dashboard — Auth required, seller stats
export async function GET() {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult

    const [activeListings, activeAuctions, totalOrders, totalEarnings, ratings] = await Promise.all([
        prisma.listing.count({
            where: { sellerId: user.id, status: 'ACTIVE' },
        }),
        prisma.listing.count({
            where: { sellerId: user.id, listingType: 'AUCTION', status: 'ACTIVE' },
        }),
        prisma.order.count({
            where: { sellerId: user.id },
        }),
        prisma.order.aggregate({
            where: { sellerId: user.id },
            _sum: { total: true },
        }),
        prisma.rating.findMany({
            where: {
                listing: { sellerId: user.id },
            },
            orderBy: { createdAt: 'desc' },
            take: 10,
            include: {
                user: { select: { id: true, name: true, image: true } },
                listing: { select: { id: true, name: true, category: true } },
            },
        }),
    ])

    return Response.json({
        activeListings,
        activeAuctions,
        totalOrders,
        totalEarnings: totalEarnings._sum.total || 0,
        ratings,
    })
}
