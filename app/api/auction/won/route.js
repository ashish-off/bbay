import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/auction/won — Auth required, get user's won auctions
export async function GET() {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult

    // Find all listings this user won
    const wonListings = await prisma.listing.findMany({
        where: {
            winnerId: user.id,
            status: 'SOLD',
            listingType: 'AUCTION',
        },
        orderBy: { updatedAt: 'desc' },
        include: {
            seller: { select: { id: true, name: true, image: true } },
            orderItems: {
                where: {
                    order: { userId: user.id },
                },
                include: {
                    order: { select: { id: true, isPaid: true, paymentMethod: true, status: true, createdAt: true } },
                },
            },
        },
    })

    // Map to a friendlier response
    const results = wonListings.map(listing => {
        const existingOrder = listing.orderItems?.[0]?.order || null
        return {
            id: listing.id,
            name: listing.name,
            images: listing.images,
            category: listing.category,
            currentBid: listing.currentBid,
            startingBid: listing.startingBid,
            bidCount: listing.bidCount,
            auctionEndTime: listing.auctionEndTime,
            seller: listing.seller,
            winnerId: listing.winnerId,
            winnerBidId: listing.winnerBidId,
            // Payment status
            isPaid: existingOrder?.isPaid || false,
            hasOrder: Boolean(existingOrder),
            order: existingOrder,
        }
    })

    return Response.json(results)
}
