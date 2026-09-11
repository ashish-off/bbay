import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { verifyEsewaResponse } from '@/lib/esewa'

// GET /api/esewa/verify — eSewa redirects here on success with Base64-encoded data
export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const encodedData = searchParams.get('data')
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'

    if (!encodedData) {
        return NextResponse.redirect(`${baseUrl}/orders?payment=failed&reason=no-data`)
    }

    try {
        // Decode Base64 response from eSewa
        const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8')
        const responseData = JSON.parse(decodedString)

        const { transaction_code, status, total_amount, transaction_uuid, product_code } = responseData

        // 1. Verify HMAC signature
        const isValidSignature = verifyEsewaResponse(responseData)
        if (!isValidSignature) {
            console.error('eSewa signature verification failed', responseData)
            return NextResponse.redirect(`${baseUrl}/orders?payment=failed&reason=invalid-signature`)
        }

        // 2. Double-check with eSewa Status API
        const statusUrl = process.env.ESEWA_STATUS_URL || 'https://rc.esewa.com.np/api/epay/transaction/status/'
        const statusCheckUrl = `${statusUrl}?product_code=${product_code}&total_amount=${total_amount}&transaction_uuid=${transaction_uuid}`

        const statusRes = await fetch(statusCheckUrl)
        const statusData = await statusRes.json()

        if (statusData.status !== 'COMPLETE') {
            console.error('eSewa status check failed', statusData)
            return NextResponse.redirect(`${baseUrl}/orders?payment=failed&reason=not-complete`)
        }

        // 3. Mark orders as paid

        const orderIds = transaction_uuid.split('-')
        
        // Try finding individual orders, or find by composite transaction_uuid
        let orders = await prisma.order.findMany({
            where: { id: { in: orderIds } },
        })

        // If no orders found with split IDs, try the full transaction_uuid as a single order ID
        if (orders.length === 0) {
            const singleOrder = await prisma.order.findUnique({
                where: { id: transaction_uuid },
            })
            if (singleOrder) orders = [singleOrder]
        }

        if (orders.length === 0) {
            console.error('No orders found for transaction_uuid:', transaction_uuid)
            return NextResponse.redirect(`${baseUrl}/orders?payment=failed&reason=order-not-found`)
        }

        // Update all matched orders
        for (const order of orders) {
            await prisma.order.update({
                where: { id: order.id },
                data: {
                    isPaid: true,
                    esewaRefId: transaction_code || statusData.ref_id || null,
                },
            })
        }

        return NextResponse.redirect(`${baseUrl}/orders?payment=success`)
    } catch (error) {
        console.error('eSewa verify error:', error)
        return NextResponse.redirect(`${baseUrl}/orders?payment=failed&reason=server-error`)
    }
}
