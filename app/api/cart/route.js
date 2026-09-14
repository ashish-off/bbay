import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/cart — Auth required, return user's CartItems with listing data
export async function GET() {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult

    const cartItems = await prisma.cartItem.findMany({
        where: { userId: user.id },
        include: {
            listing: {
                include: {
                    seller: { select: { id: true, name: true, image: true } },
                },
            },
        },
        orderBy: { createdAt: 'desc' },
    })

    const cartMap = {}
    const items = cartItems.map(ci => {
        cartMap[ci.listingId] = ci.quantity
        return {
            ...ci.listing,
            cartItemId: ci.id,
            quantity: ci.quantity,
        }
    })

    return Response.json({ cart: cartMap, items })
}

// POST /api/cart — Auth required, add item or increment quantity in CartItem
export async function POST(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const { listingId, quantity = 1 } = await request.json()

    if (!listingId) {
        return Response.json({ error: 'listingId is required' }, { status: 400 })
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (!listing.inStock || (listing.stock !== null && listing.stock <= 0)) {
        return Response.json({ error: 'Item is out of stock' }, { status: 400 })
    }

    const existingCartItem = await prisma.cartItem.findUnique({
        where: { userId_listingId: { userId: user.id, listingId } },
    })
    const requestedTotal = (existingCartItem?.quantity || 0) + quantity
    if (listing.stock !== null && requestedTotal > listing.stock) {
        return Response.json({
            error: `Cannot add more. Only ${listing.stock} available in stock (you already have ${existingCartItem?.quantity || 0} in cart).`
        }, { status: 400 })
    }

    const cartItem = await prisma.cartItem.upsert({
        where: {
            userId_listingId: {
                userId: user.id,
                listingId,
            },
        },
        update: {
            quantity: { increment: quantity },
        },
        create: {
            userId: user.id,
            listingId,
            quantity,
        },
        include: {
            listing: {
                include: {
                    seller: { select: { id: true, name: true, image: true } },
                },
            },
        },
    })

    return Response.json({ success: true, item: cartItem })
}

// PUT /api/cart — Auth required, update exact quantity for a listingId
export async function PUT(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const { listingId, quantity } = await request.json()

    if (!listingId || quantity === undefined) {
        return Response.json({ error: 'listingId and quantity are required' }, { status: 400 })
    }

    if (quantity <= 0) {
        await prisma.cartItem.deleteMany({
            where: { userId: user.id, listingId },
        })
        return Response.json({ success: true, removed: true })
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } })
    if (!listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
    }

    if (!listing.inStock || (listing.stock !== null && listing.stock <= 0)) {
        return Response.json({ error: 'Item is out of stock' }, { status: 400 })
    }

    if (listing.stock !== null && quantity > listing.stock) {
        return Response.json({ 
            error: `Cannot select ${quantity}. Only ${listing.stock} available in stock.` 
        }, { status: 400 })
    }

    const cartItem = await prisma.cartItem.upsert({
        where: {
            userId_listingId: {
                userId: user.id,
                listingId,
            },
        },
        update: { quantity },
        create: {
            userId: user.id,
            listingId,
            quantity,
        },
    })

    return Response.json({ success: true, item: cartItem })
}

// DELETE /api/cart — Auth required, delete item by listingId or clear entire cart
export async function DELETE(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')

    if (listingId) {
        await prisma.cartItem.deleteMany({
            where: { userId: user.id, listingId },
        })
    } else {
        await prisma.cartItem.deleteMany({
            where: { userId: user.id },
        })
    }

    return Response.json({ success: true })
}
