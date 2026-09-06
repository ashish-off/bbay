import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

// PUT /api/admin/users/[id] — Admin only, update isActive
export async function PUT(request, { params }) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    if (!isAdmin(user.email)) {
        return Response.json({ error: 'Admin only' }, { status: 403 })
    }

    const { id } = await params

    const targetUser = await prisma.user.findUnique({ where: { id } })
    if (!targetUser) {
        return Response.json({ error: 'User not found' }, { status: 404 })
    }

    // Safety: prevent admin from suspending themselves
    if (targetUser.id === user.id || targetUser.email.toLowerCase() === user.email.toLowerCase()) {
        return Response.json({ error: 'Cannot suspend your own admin account' }, { status: 400 })
    }

    let body = {}
    try {
        body = await request.json()
    } catch {}

    const nextActive = body.isActive !== undefined ? Boolean(body.isActive) : !targetUser.isActive

    const updated = await prisma.user.update({
        where: { id },
        data: { isActive: nextActive },
        include: {
            _count: {
                select: {
                    listings: true,
                    buyerOrders: true,
                    sellerOrders: true,
                    bids: true,
                },
            },
        },
    })

    return Response.json(updated)
}
