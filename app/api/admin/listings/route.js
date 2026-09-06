import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

// GET /api/admin/listings — Admin only, list all listings with seller and stats
export async function GET() {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    if (!isAdmin(user.email)) {
        return Response.json({ error: 'Admin only' }, { status: 403 })
    }

    const listings = await prisma.listing.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            seller: { select: { id: true, name: true, email: true, image: true } },
            _count: {
                select: {
                    bids: true,
                    orderItems: true,
                    watchedBy: true,
                    ratings: true,
                },
            },
        },
    })

    return Response.json(listings)
}
