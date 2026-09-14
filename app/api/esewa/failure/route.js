import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET /api/esewa/failure — eSewa redirects here on failure/cancel
export async function GET(request) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    const { searchParams } = new URL(request.url)
    const encodedData = searchParams.get('data')

    if (encodedData) {
        try {
            const decodedString = Buffer.from(encodedData, 'base64').toString('utf-8')
            const responseData = JSON.parse(decodedString)
            const transactionUuid = responseData.transaction_uuid
            if (transactionUuid) {
                const orderIds = transactionUuid.split('-')
                await prisma.order.deleteMany({
                    where: {
                        id: { in: orderIds },
                        isPaid: false,
                        paymentMethod: 'ESEWA',
                    },
                })
            }
        } catch (err) {
            console.error('eSewa failure decode error:', err)
        }
    }

    // Redirect to cart page with payment cancelled query parameter
    return NextResponse.redirect(`${baseUrl}/cart?payment=cancelled`)
}
