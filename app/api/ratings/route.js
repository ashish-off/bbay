import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/ratings?listingId=xxx — Public
export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')

    if (!listingId) {
        return Response.json({ error: 'listingId required' }, { status: 400 })
    }

    const ratings = await prisma.rating.findMany({
        where: { listingId },
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, image: true } },
        },
    })

    return Response.json(ratings)
}

// POST /api/ratings — Auth required
export async function POST(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const { listingId, orderId, rating, review } = await request.json()

    if (!listingId || !orderId || !rating || !review) {
        return Response.json({ error: 'listingId, orderId, rating, review required' }, { status: 400 })
    }

    if (rating < 1 || rating > 5) {
        return Response.json({ error: 'Rating must be 1-5' }, { status: 400 })
    }

    // Verify user has a delivered order with this listing
    const order = await prisma.order.findFirst({
        where: {
            id: orderId,
            userId: user.id,
            status: 'DELIVERED',
            orderItems: {
                some: { listingId },
            },
        },
    })

    if (!order) {
        return Response.json({ error: 'You can only rate delivered orders' }, { status: 400 })
    }

    // Check unique constraint
    const existing = await prisma.rating.findUnique({
        where: {
            userId_listingId_orderId: { userId: user.id, listingId, orderId },
        },
    })

    if (existing) {
        return Response.json({ error: 'Already rated this item for this order' }, { status: 400 })
    }

    const newRating = await prisma.rating.create({
        data: {
            rating,
            review,
            userId: user.id,
            listingId,
            orderId,
        },
        include: {
            user: { select: { id: true, name: true, image: true } },
        },
    })

    return Response.json(newRating, { status: 201 })
}
