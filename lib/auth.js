import { auth, currentUser } from '@clerk/nextjs/server'
import prisma from './prisma'

/**
 * Get authenticated user from Clerk + DB.
 * Returns { userId, user } or null if not authenticated.
 * Throws 401 Response if requireAuth is true and user is not authenticated.
 */
export async function getAuthUser() {
    const { userId } = await auth()

    if (!userId) {
        return null
    }

    try {
        const clerkUser = await currentUser()
        if (!clerkUser) return null

        const freshName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'bbay User'
        const freshEmail = clerkUser.emailAddresses?.[0]?.emailAddress || ''
        const freshImage = clerkUser.imageUrl || ''

        const user = await prisma.user.upsert({
            where: { id: userId },
            update: {
                name: freshName,
                email: freshEmail,
                image: freshImage,
            },
            create: {
                id: userId,
                name: freshName,
                email: freshEmail,
                image: freshImage,
            },
        })

        return { userId, user }
    } catch (err) {
        console.error('getAuthUser error:', err)
        return null
    }
}
