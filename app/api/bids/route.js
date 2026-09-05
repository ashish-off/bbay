import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/bids — If listingId query param: public bids for listing. Otherwise: auth required, get my bids
export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const listingId = searchParams.get('listingId')

    if (listingId) {
        const bids = await prisma.bid.findMany({
            where: { listingId },
            orderBy: { createdAt: 'desc' },
            include: {
                bidder: { select: { id: true, name: true, image: true } },
            },
        })
        return Response.json(bids)
    }

    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult

    const bids = await prisma.bid.findMany({
        where: { bidderId: user.id },
        orderBy: { createdAt: 'desc' },
        include: {
            listing: {
                select: {
                    id: true, name: true, images: true, category: true,
                    currentBid: true, auctionEndTime: true, status: true,
                    listingType: true, bidCount: true,
                },
            },
        },
    })

    return Response.json(bids)
}

// POST /api/bids — Auth required, place a bid
export async function POST(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const { listingId, amount } = await request.json()

    if (!listingId || !amount) {
        return Response.json({ error: 'listingId and amount required' }, { status: 400 })
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } })

    if (!listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
    }
    if (listing.listingType !== 'AUCTION') {
        return Response.json({ error: 'Not an auction listing' }, { status: 400 })
    }
    if (listing.status !== 'ACTIVE') {
        return Response.json({ error: 'Auction is not active' }, { status: 400 })
    }
    if (listing.auctionEndTime && new Date(listing.auctionEndTime) < new Date()) {
        return Response.json({ error: 'Auction has ended' }, { status: 400 })
    }
    if (listing.sellerId === user.id) {
        return Response.json({ error: 'Cannot bid on your own listing' }, { status: 400 })
    }
    if (amount <= (listing.currentBid || 0)) {
        return Response.json(
            { error: `Bid must be higher than current bid of ${listing.currentBid}` },
            { status: 400 }
        )
    }

    // Transaction: create bid + update listing
    const [bid] = await prisma.$transaction([
        prisma.bid.create({
            data: {
                amount,
                listingId,
                bidderId: user.id,
            },
            include: {
                bidder: { select: { id: true, name: true, image: true } },
            },
        }),
        prisma.listing.update({
            where: { id: listingId },
            data: {
                currentBid: amount,
                bidCount: { increment: 1 },
            },
        }),
    ])

    return Response.json(bid, { status: 201 })
}
