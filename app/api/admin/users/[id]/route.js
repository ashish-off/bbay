import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

// PUT /api/admin/users/[id] — Admin only, toggle isActive
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

    const updated = await prisma.user.update({
        where: { id },
        data: { isActive: !targetUser.isActive },
    })

    return Response.json(updated)
}
