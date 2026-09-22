import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { generateEsewaSignature, buildSignatureMessage } from '@/lib/esewa'
import { calculateOrderBilling } from '@/lib/pricing'

// POST /api/auction/esewa-initiate — eSewa payment for won auction
export async function POST(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const { listingId, addressId, couponCode } = await request.json()

    if (!listingId || !addressId) {
        return Response.json({ error: 'listingId and addressId required' }, { status: 400 })
    }

    // Verify listing exists, user is the winner, status is SOLD
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
        paymentMethod: 'ESEWA',
    })
    const total = billing.finalTotal

    // Create order (isPaid = false, will be confirmed on verify callback)
    const order = await prisma.order.create({
        data: {
            total,
            userId: user.id,
            sellerId: listing.sellerId,
            addressId,
            paymentMethod: 'ESEWA',
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
    })

    // Generate eSewa form data — prefix with "auction-" so verify route can identify it
    const transactionUuid = `auction-${order.id}`
    const productCode = process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST'

    const signatureMessage = buildSignatureMessage(total, transactionUuid, productCode)
    const signature = generateEsewaSignature(signatureMessage)

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    const formData = {
        amount: String(total),
        tax_amount: '0',
        total_amount: String(total),
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
        orderId: order.id,
    })
}
