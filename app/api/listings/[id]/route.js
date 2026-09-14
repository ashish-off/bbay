import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/listings/[id] — Public single listing
export async function GET(request, { params }) {
    const { id } = await params

    const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
            seller: { select: { id: true, name: true, image: true } },
            bids: {
                orderBy: { createdAt: 'desc' },
                take: 20,
                include: {
                    bidder: { select: { id: true, name: true, image: true } },
                },
            },
            ratings: {
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, image: true } },
                },
            },
            _count: { select: { bids: true, watchedBy: true } },
        },
    })

    if (!listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
    }

    return Response.json(listing)
}

// PUT /api/listings/[id] — Auth required (owner only)
export async function PUT(request, { params }) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { user } = authResult

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
    }
    if (listing.sellerId !== user.id) {
        return Response.json({ error: 'Not your listing' }, { status: 403 })
    }

    const body = await request.json()
    const allowedFields = ['name', 'description', 'category', 'price', 'mrp', 'inStock', 'stock']
    const data = {}
    for (const field of allowedFields) {
        if (body[field] !== undefined) data[field] = body[field]
    }
    if (body.stock !== undefined) {
        const numStock = parseInt(body.stock, 10)
        data.stock = isNaN(numStock) ? 0 : Math.max(0, numStock)
        if (body.inStock === undefined) {
            data.inStock = data.stock > 0
        }
    }

    const updated = await prisma.listing.update({
        where: { id },
        data,
        include: {
            seller: { select: { id: true, name: true, image: true } },
        },
    })

    return Response.json(updated)
}

// DELETE /api/listings/[id] — Auth required (owner only), soft delete
export async function DELETE(request, { params }) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { user } = authResult

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
    }
    if (listing.sellerId !== user.id) {
        return Response.json({ error: 'Not your listing' }, { status: 403 })
    }

    await prisma.listing.update({
        where: { id },
        data: { status: 'CANCELLED', inStock: false },
    })

    return Response.json({ deleted: true })
}
