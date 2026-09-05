import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/seller/orders — Auth required, orders where I'm the seller
export async function GET() {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult

    const orders = await prisma.order.findMany({
        where: { sellerId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            user: { select: { id: true, name: true, email: true, image: true } },
            address: true,
            orderItems: {
                include: {
                    listing: {
                        select: { id: true, name: true, images: true, category: true },
                    },
                },
            },
        },
    })

    return Response.json(orders)
}
