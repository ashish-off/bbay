import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

// DELETE /api/coupons/[code] — Admin only
export async function DELETE(request, { params }) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    if (!isAdmin(user.email)) {
        return Response.json({ error: 'Admin only' }, { status: 403 })
    }

    const { code } = await params

    try {
        await prisma.coupon.delete({ where: { code } })
        return Response.json({ deleted: true })
    } catch {
        return Response.json({ error: 'Coupon not found' }, { status: 404 })
    }
}
