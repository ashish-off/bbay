import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/seller/listings — Auth required, get my listings
export async function GET() {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult

    const listings = await prisma.listing.findMany({
        where: { 
            sellerId: user.id,
            status: { not: 'CANCELLED' },
        },
        orderBy: { createdAt: 'desc' },
        include: {
            _count: { select: { bids: true, orderItems: true, watchedBy: true } },
        },
    })


    return Response.json(listings)
}
