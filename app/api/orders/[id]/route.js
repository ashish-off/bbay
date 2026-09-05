import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/orders/[id] — Auth required (buyer or seller)
export async function GET(request, { params }) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { user } = authResult

    const order = await prisma.order.findUnique({
        where: { id },
        include: {
            orderItems: {
                include: {
                    listing: {
                        select: { id: true, name: true, images: true, category: true },
                    },
                },
            },
            address: true,
            user: { select: { id: true, name: true, email: true, image: true } },
            seller: { select: { id: true, name: true, image: true } },
        },
    })

    if (!order) {
        return Response.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.userId !== user.id && order.sellerId !== user.id) {
        return Response.json({ error: 'Access denied' }, { status: 403 })
    }

    return Response.json(order)
}

// PUT /api/orders/[id] — Auth required (seller only), update status
export async function PUT(request, { params }) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { user } = authResult
    const { status } = await request.json()

    const order = await prisma.order.findUnique({ where: { id } })
    if (!order) {
        return Response.json({ error: 'Order not found' }, { status: 404 })
    }
    if (order.sellerId !== user.id) {
        return Response.json({ error: 'Only seller can update status' }, { status: 403 })
    }

    const validStatuses = ['ORDER_PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED']
    if (!validStatuses.includes(status)) {
        return Response.json({ error: 'Invalid status' }, { status: 400 })
    }

    const updated = await prisma.order.update({
        where: { id },
        data: { status },
    })

    return Response.json(updated)
}
