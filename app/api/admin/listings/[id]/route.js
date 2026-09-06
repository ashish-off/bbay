import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

// PUT /api/admin/listings/[id] — Admin only, update listing status and/or inStock
export async function PUT(request, { params }) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    if (!isAdmin(user.email)) {
        return Response.json({ error: 'Admin only' }, { status: 403 })
    }

    const { id } = await params

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
    }

    // Check if JSON body with explicit status or inStock was passed
    let body = {}
    try {
        body = await request.json()
    } catch {}

    const data = {}

    if (body.status !== undefined) {
        const validStatuses = ['ACTIVE', 'SOLD', 'EXPIRED', 'CANCELLED']
        if (validStatuses.includes(body.status)) {
            data.status = body.status
            if (body.status === 'ACTIVE') {
                data.inStock = true
            } else if (body.status === 'CANCELLED' || body.status === 'EXPIRED') {
                data.inStock = false
            }
        }
    } else if (body.inStock !== undefined) {
        data.inStock = Boolean(body.inStock)
        data.status = body.inStock ? 'ACTIVE' : 'CANCELLED'
    } else {
        // Toggle: If currently ACTIVE and inStock, deactivate to CANCELLED; else activate to ACTIVE
        const isCurrentlyActive = listing.status === 'ACTIVE' && listing.inStock
        data.status = isCurrentlyActive ? 'CANCELLED' : 'ACTIVE'
        data.inStock = !isCurrentlyActive
    }

    const updated = await prisma.listing.update({
        where: { id },
        data,
        include: {
            seller: { select: { id: true, name: true, email: true, image: true } },
            _count: {
                select: {
                    bids: true,
                    orderItems: true,
                    watchedBy: true,
                    ratings: true,
                },
            },
        },
    })

    return Response.json(updated)
}
