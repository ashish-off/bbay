import { inngest } from './client'
import prisma from '@/lib/prisma'

// ─── Sync Clerk User to DB ─────────────────────────────────────────
// Triggered by Clerk webhook via app/api/clerk/webhook/route.js
export const syncClerkUser = inngest.createFunction(
    {
        id: 'sync-clerk-user',
        triggers: [{ event: 'clerk/user.synced' }],
        retries: 3,
    },
    async ({ event, step }) => {
        const { type, clerkUser } = event.data

        if (type === 'user.deleted') {
            await step.run('soft-delete-user', async () => {
                await prisma.user.update({
                    where: { id: clerkUser.id },
                    data: { isActive: false },
                }).catch(() => {
                    // User might not exist in DB yet — ignore
                })
            })
            return { action: 'soft-deleted', userId: clerkUser.id }
        }

        // user.created or user.updated
        const user = await step.run('upsert-user', async () => {
            const email = clerkUser.email_addresses?.[0]?.email_address || ''
            const name = `${clerkUser.first_name || ''} ${clerkUser.last_name || ''}`.trim() || 'bbay User'
            const image = clerkUser.image_url || ''

            return await prisma.user.upsert({
                where: { id: clerkUser.id },
                update: { name, email, image },
                create: { id: clerkUser.id, name, email, image },
            })
        })

        return { action: type === 'user.created' ? 'created' : 'updated', userId: user.id }
    }
)

// ─── Expire Auctions (Cron) ────────────────────────────────────────
// Runs every 5 minutes, finds expired ACTIVE auctions, marks them EXPIRED or SOLD
export const expireAuctions = inngest.createFunction(
    {
        id: 'expire-auctions',
        triggers: [{ cron: '*/5 * * * *' }],
        retries: 2,
    },
    async ({ step }) => {
        const expiredListings = await step.run('find-expired-auctions', async () => {
            return await prisma.listing.findMany({
                where: {
                    listingType: 'AUCTION',
                    status: 'ACTIVE',
                    auctionEndTime: { lte: new Date() },
                },
                include: {
                    bids: {
                        orderBy: { amount: 'desc' },
                        take: 1,
                        include: { bidder: true },
                    },
                },
            })
        })

        if (expiredListings.length === 0) {
            return { expired: 0 }
        }

        // Mark each expired auction
        for (const listing of expiredListings) {
            const hasBids = listing.bids.length > 0
            const winningBid = hasBids ? listing.bids[0] : null

            await step.run(`expire-listing-${listing.id}`, async () => {
                await prisma.listing.update({
                    where: { id: listing.id },
                    data: {
                        status: hasBids ? 'SOLD' : 'EXPIRED',
                        inStock: false,
                        // Record the auction winner
                        ...(winningBid ? {
                            winnerId: winningBid.bidderId,
                            winnerBidId: winningBid.id,
                        } : {}),
                    },
                })
            })
        }

        return { expired: expiredListings.length }
    }
)

