import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { calculateOrderBilling } from '@/lib/pricing'

// POST /api/auction/checkout — Auth required, create order for won auction (COD)
export async function POST(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const { listingId, addressId, paymentMethod, couponCode } = await request.json()

    if (!listingId || !addressId) {
        return Response.json({ error: 'listingId and addressId required' }, { status: 400 })
    }

    // Verify listing exists, user is the winner, and status is SOLD
    const listing = await prisma.listing.findUnique({
        where: { id: listingId },
        include: {
            orderItems: {
                where: { order: { userId: user.id } },
                take: 1,
            },
        },
    })

    if (!listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
    }
    if (listing.winnerId !== user.id) {
        return Response.json({ error: 'You are not the winner of this auction' }, { status: 403 })
    }
    if (listing.status !== 'SOLD') {
        return Response.json({ error: 'Auction is not in SOLD state' }, { status: 400 })
    }
    if (listing.orderItems.length > 0) {
        return Response.json({ error: 'An order already exists for this auction' }, { status: 409 })
    }

    // Verify address belongs to user
    const address = await prisma.address.findUnique({ where: { id: addressId } })
    if (!address || address.userId !== user.id) {
        return Response.json({ error: 'Invalid address' }, { status: 400 })
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

    const winningPrice = listing.currentBid || listing.startingBid || 0
    const billing = calculateOrderBilling({
        subtotal: winningPrice,
        discountPercent,
        paymentMethod: paymentMethod || 'COD',
    })
    const total = billing.finalTotal

    const order = await prisma.$transaction(async (tx) => {
        const createdOrder = await tx.order.create({
            data: {
                total,
                userId: user.id,
                sellerId: listing.sellerId,
                addressId,
                paymentMethod: paymentMethod || 'COD',
                isPaid: false,
                isCouponUsed: discountPercent > 0,
                coupon: couponData,
                orderItems: {
                    create: {
                        listingId: listing.id,
                        quantity: 1,
                        price: winningPrice,
                    },
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

        // Mark listing as out of stock and SOLD
        await tx.listing.update({
            where: { id: listing.id },
            data: {
                stock: 0,
                inStock: false,
                status: 'SOLD',
            },
        })

        return createdOrder
    }, {
        maxWait: 10000,
        timeout: 30000,
    })

    return Response.json(order, { status: 201 })
}
