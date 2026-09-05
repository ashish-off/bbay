import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/orders — Auth required, get buyer's orders
export async function GET() {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult

    const orders = await prisma.order.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            orderItems: {
                include: {
                    listing: {
                        select: { id: true, name: true, images: true, category: true },
                    },
                },
            },
            address: true,
            seller: { select: { id: true, name: true, image: true } },
        },
    })

    return Response.json(orders)
}

// POST /api/orders — Auth required, place order from cart
export async function POST(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const { addressId, paymentMethod, couponCode } = await request.json()

    if (!addressId) {
        return Response.json({ error: 'addressId required' }, { status: 400 })
    }

    const cart = user.cart || {}
    const listingIds = Object.keys(cart)

    if (listingIds.length === 0) {
        return Response.json({ error: 'Cart is empty' }, { status: 400 })
    }

    // Verify address belongs to user
    const address = await prisma.address.findUnique({ where: { id: addressId } })
    if (!address || address.userId !== user.id) {
        return Response.json({ error: 'Invalid address' }, { status: 400 })
    }

    // Fetch listings
    const listings = await prisma.listing.findMany({
        where: { id: { in: listingIds }, inStock: true, status: 'ACTIVE' },
    })

    if (listings.length === 0) {
        return Response.json({ error: 'No valid items in cart' }, { status: 400 })
    }

    // Handle coupon
    let couponData = {}
    let discountPercent = 0
    if (couponCode) {
        const coupon = await prisma.coupon.findUnique({ where: { code: couponCode } })
        if (coupon && new Date(coupon.expiresAt) > new Date()) {
            discountPercent = coupon.discount
            couponData = { code: coupon.code, discount: coupon.discount }
        }
    }

    // Group items by seller
    const sellerGroups = {}
    for (const listing of listings) {
        const qty = cart[listing.id] || 1
        const price = listing.buyNowPrice || listing.price || 0
        if (!sellerGroups[listing.sellerId]) {
            sellerGroups[listing.sellerId] = { items: [], total: 0 }
        }
        sellerGroups[listing.sellerId].items.push({
            listingId: listing.id,
            quantity: qty,
            price,
        })
        sellerGroups[listing.sellerId].total += price * qty
    }

    // Create one order per seller in a transaction
    const orders = await prisma.$transaction(async (tx) => {
        const createdOrders = []

        for (const [sellerId, group] of Object.entries(sellerGroups)) {
            let total = group.total
            if (discountPercent > 0) {
                total = total - (total * discountPercent / 100)
            }

            const order = await tx.order.create({
                data: {
                    total,
                    userId: user.id,
                    sellerId,
                    addressId,
                    paymentMethod: paymentMethod || 'COD',
                    isCouponUsed: discountPercent > 0,
                    coupon: couponData,
                    orderItems: {
                        create: group.items,
                    },
                },
                include: {
                    orderItems: {
                        include: {
                            listing: { select: { id: true, name: true, images: true } },
                        },
                    },
                },
            })
            createdOrders.push(order)
        }

        // Clear cart
        await tx.user.update({
            where: { id: user.id },
            data: { cart: {} },
        })

        return createdOrders
    })

    return Response.json(orders, { status: 201 })
}
