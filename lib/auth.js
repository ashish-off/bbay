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

    let user = await prisma.user.findUnique({
        where: { id: userId },
    })

    if (!user) {
        // User exists in Clerk but not in our DB yet — create from Clerk data
        try {
            const clerkUser = await currentUser()
            if (clerkUser) {
                user = await prisma.user.create({
                    data: {
                        id: clerkUser.id,
                        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'bbay User',
                        email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
                        image: clerkUser.imageUrl || '',
                    },
                })
            } else {
                return null
            }
        } catch {
            return null
        }
    }

    return { userId, user }
}
