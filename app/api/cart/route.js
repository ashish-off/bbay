import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/cart — Auth required, get cart with resolved listings
export async function GET() {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const cart = user.cart || {}

    // Resolve listing IDs to full listing data
    const listingIds = Object.keys(cart)
    if (listingIds.length === 0) {
        return Response.json({ cart: {}, items: [] })
    }

    const listings = await prisma.listing.findMany({
        where: { id: { in: listingIds } },
        include: {
            seller: { select: { id: true, name: true, image: true } },
        },
    })

    const items = listings.map(listing => ({
        ...listing,
        quantity: cart[listing.id] || 1,
    }))

    return Response.json({ cart, items })
}

// PUT /api/cart — Auth required, sync cart
export async function PUT(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const { cart } = await request.json()

    if (typeof cart !== 'object') {
        return Response.json({ error: 'cart must be an object' }, { status: 400 })
    }

    await prisma.user.update({
        where: { id: user.id },
        data: { cart },
    })

    return Response.json({ cart, synced: true })
}
