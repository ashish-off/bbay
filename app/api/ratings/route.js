import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/ratings?listingId=xxx — Public, fetch ratings for a listing
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

// POST /api/ratings — Auth required, add or update a review
export async function POST(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized. Please sign in to review' }, { status: 401 })

    const { user } = authResult
    const { listingId, orderId, rating, review } = await request.json()

    if (!listingId || !rating || !review?.trim()) {
        return Response.json({ error: 'listingId, rating, and review text are required' }, { status: 400 })
    }

    const numRating = parseInt(rating)
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
        return Response.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (listing.sellerId === user.id) {
        return Response.json({ error: 'You cannot review your own listing' }, { status: 400 })
    }

    // Find any order by this user containing this listing for verified purchase badge
    const userOrder = await prisma.order.findFirst({
        where: {
            userId: user.id,
            orderItems: { some: { listingId } },
        },
    })

    const effectiveOrderId = orderId || userOrder?.id || `rev_${user.id.slice(-8)}_${listingId.slice(-8)}`

    // Check if user already reviewed this listing
    const existing = await prisma.rating.findFirst({
        where: {
            userId: user.id,
            listingId,
        },
    })

    if (existing) {
        const updated = await prisma.rating.update({
            where: { id: existing.id },
            data: {
                rating: numRating,
                review: review.trim(),
                orderId: effectiveOrderId,
            },
            include: {
                user: { select: { id: true, name: true, image: true } },
            },
        })
        return Response.json({ ...updated, isUpdated: true }, { status: 200 })
    }

    const newRating = await prisma.rating.create({
        data: {
            rating: numRating,
            review: review.trim(),
            userId: user.id,
            listingId,
            orderId: effectiveOrderId,
        },
        include: {
            user: { select: { id: true, name: true, image: true } },
        },
    })

    return Response.json(newRating, { status: 201 })
}
