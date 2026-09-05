import { getAuthUser } from '@/lib/auth'
import { isAdmin } from '@/lib/admin'

export async function GET() {
    const authResult = await getAuthUser()
    if (!authResult) {
        return Response.json({ isAdmin: false })
    }

    const { user } = authResult
    const admin = isAdmin(user.email)

    return Response.json({
        isAdmin: admin,
        email: user.email,
        name: user.name,
    })
}
