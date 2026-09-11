import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { generateEsewaSignature, buildSignatureMessage } from '@/lib/esewa'

// POST /api/esewa/initiate — Create order + return eSewa form params
export async function POST(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const { addressId, couponCode } = await request.json()

    if (!addressId) {
        return Response.json({ error: 'addressId required' }, { status: 400 })
    }

    // Fetch cart items
    const cartItems = await prisma.cartItem.findMany({
        where: { userId: user.id },
        include: { listing: true },
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

    // Fallback to legacy cart JSON
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

    // Verify address
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

    // Group by seller and create orders
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

    // Create orders (isPaid = false) and clear cart
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
                    paymentMethod: 'ESEWA',
                    isPaid: false,
                    isCouponUsed: discountPercent > 0,
                    coupon: couponData,
                    orderItems: {
                        create: group.items,
                    },
                },
            })
            createdOrders.push(order)
        }

        // Clear cart
        await tx.cartItem.deleteMany({ where: { userId: user.id } })
        await tx.user.update({ where: { id: user.id }, data: { cart: {} } })

        return createdOrders
    }, {
        maxWait: 10000,
        timeout: 30000,
    })

    // Calculate grand total across all seller orders
    const grandTotal = orders.reduce((sum, o) => sum + o.total, 0)
    // Use first order's ID as transaction UUID (hyphenated for eSewa)
    const transactionUuid = orders.map(o => o.id).join('-')
    const productCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST'

    // Generate HMAC signature
    const signatureMessage = buildSignatureMessage(grandTotal, transactionUuid, productCode)
    const signature = generateEsewaSignature(signatureMessage)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const formData = {
        amount: String(grandTotal),
        tax_amount: '0',
        total_amount: String(grandTotal),
        transaction_uuid: transactionUuid,
        product_code: productCode,
        product_service_charge: '0',
        product_delivery_charge: '0',
        success_url: `${baseUrl}/api/esewa/verify`,
        failure_url: `${baseUrl}/api/esewa/failure`,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
    }

    return Response.json({
        formData,
        paymentUrl: process.env.NEXT_PUBLIC_ESEWA_PAYMENT_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
        orderIds: orders.map(o => o.id),
    })
}
