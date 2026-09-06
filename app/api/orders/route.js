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

    // Fetch cart items from CartItem table (and fallback to user.cart JSON if any)
    const cartItems = await prisma.cartItem.findMany({
        where: { userId: user.id },
        include: {
            listing: true,
        },
    })

    const listingMap = {}
    cartItems.forEach(ci => {
        if (ci.listing && ci.listing.inStock && ci.listing.status === 'ACTIVE') {
            listingMap[ci.listingId] = {
                listing: ci.listing,
                quantity: ci.quantity,
            }
        }
    })

    // Backward compatibility with legacy cart JSON
    if (Object.keys(listingMap).length === 0 && user.cart && typeof user.cart === 'object') {
        const legacyIds = Object.keys(user.cart)
        if (legacyIds.length > 0) {
            const legacyListings = await prisma.listing.findMany({
                where: { id: { in: legacyIds }, inStock: true, status: 'ACTIVE' },
            })
            legacyListings.forEach(l => {
                listingMap[l.id] = {
                    listing: l,
                    quantity: user.cart[l.id] || 1,
                }
            })
        }
    }

    const itemsToOrder = Object.values(listingMap)
    if (itemsToOrder.length === 0) {
        return Response.json({ error: 'Cart is empty or items unavailable' }, { status: 400 })
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

    // Group items by seller
    const sellerGroups = {}
    for (const item of itemsToOrder) {
        const { listing, quantity } = item
        const price = listing.buyNowPrice || listing.price || 0
        if (!sellerGroups[listing.sellerId]) {
            sellerGroups[listing.sellerId] = { items: [], total: 0 }
        }
        sellerGroups[listing.sellerId].items.push({
            listingId: listing.id,
            quantity,
            price,
        })
        sellerGroups[listing.sellerId].total += price * quantity
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

        // Clear cart in both CartItem table and legacy JSON
        await tx.cartItem.deleteMany({
            where: { userId: user.id },
        })
        await tx.user.update({
            where: { id: user.id },
            data: { cart: {} },
        })

        return createdOrders
    }, {
        maxWait: 10000, // 10s max wait for connection
        timeout: 30000, // 30s timeout for multi-step transaction across remote Supabase
    })

    return Response.json(orders, { status: 201 })
}
