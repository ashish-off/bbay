import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/watchlist — Auth required
export async function GET() {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult

    const watchlist = await prisma.watchlist.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            listing: {
                include: {
                    seller: { select: { id: true, name: true, image: true } },
                    _count: { select: { bids: true } },
                },
            },
        },
    })

    return Response.json(watchlist.map(w => w.listing))
}

// POST /api/watchlist — Auth required, toggle watchlist
export async function POST(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const { listingId } = await request.json()

    if (!listingId) {
        return Response.json({ error: 'listingId required' }, { status: 400 })
    }

    // Check if already watching
    const existing = await prisma.watchlist.findUnique({
        where: {
            userId_listingId: { userId: user.id, listingId },
        },
    })

    if (existing) {
        // Remove from watchlist
        await prisma.watchlist.delete({
            where: {
                userId_listingId: { userId: user.id, listingId },
            },
        })
        return Response.json({ watched: false, listingId })
    }

    // Add to watchlist
    await prisma.watchlist.create({
        data: { userId: user.id, listingId },
    })

    return Response.json({ watched: true, listingId })
}
