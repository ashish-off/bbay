import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// PUT /api/seller/orders/[id] — Auth required (seller only), update status
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
        return Response.json({ error: 'Not your order to update' }, { status: 403 })
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
