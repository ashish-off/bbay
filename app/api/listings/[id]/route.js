import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { uploadImage } from '@/lib/imagekit'

// GET /api/listings/[id] — Public single listing
export async function GET(request, { params }) {
    const { id } = await params

    const listing = await prisma.listing.findUnique({
        where: { id },
        include: {
            seller: { select: { id: true, name: true, image: true } },
            bids: {
                orderBy: { createdAt: 'desc' },
                take: 20,
                include: {
                    bidder: { select: { id: true, name: true, image: true } },
                },
            },
            ratings: {
                orderBy: { createdAt: 'desc' },
                include: {
                    user: { select: { id: true, name: true, image: true } },
                },
            },
            _count: { select: { bids: true, watchedBy: true } },
        },
    })

    if (!listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
    }

    return Response.json(listing)
}

// PUT /api/listings/[id] — Auth required (owner only)
// Accepts both JSON (for simple field updates like toggleStock) and FormData (for full edit with images)
export async function PUT(request, { params }) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { user } = authResult

    const listing = await prisma.listing.findUnique({ where: { id } })
    if (!listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
    }
    if (listing.sellerId !== user.id) {
        return Response.json({ error: 'Not your listing' }, { status: 403 })
    }

    const contentType = request.headers.get('content-type') || ''
    const isFormData = contentType.includes('multipart/form-data')

    let data = {}

    if (isFormData) {
        // Full edit via FormData (from the edit listing page)
        const formData = await request.formData()

        // Text fields
        const name = formData.get('name')
        const description = formData.get('description')
        const category = formData.get('category')
        const price = formData.get('price')
        const mrp = formData.get('mrp')
        const stock = formData.get('stock')
        const startingBid = formData.get('startingBid')
        const buyNowPrice = formData.get('buyNowPrice')

        if (name) data.name = name
        if (description) data.description = description
        if (category) data.category = category

        if (price !== null && price !== '') data.price = parseFloat(price)
        if (mrp !== null && mrp !== '') data.mrp = parseFloat(mrp)
        else if (mrp === '') data.mrp = null

        if (startingBid !== null && startingBid !== '') data.startingBid = parseFloat(startingBid)
        if (buyNowPrice !== null && buyNowPrice !== '') data.buyNowPrice = parseFloat(buyNowPrice)
        else if (buyNowPrice === '') data.buyNowPrice = null

        if (stock !== null && stock !== '') {
            const numStock = parseInt(stock, 10)
            data.stock = isNaN(numStock) ? 0 : Math.max(0, numStock)
            data.inStock = data.stock > 0
        }

        // Handle images: keep existing + upload new ones
        const existingImages = formData.getAll('existingImages').filter(Boolean)
        const newFiles = formData.getAll('images').filter(f => f && typeof f !== 'string' && f.size > 0)

        const newImageUrls = []
        for (const file of newFiles) {
            const buffer = Buffer.from(await file.arrayBuffer())
            const result = await uploadImage(buffer, file.name, '/listings')
            newImageUrls.push(result.url)
        }

        data.images = [...existingImages, ...newImageUrls]

        // Auction duration handling
        const duration = formData.get('duration')
        const durationHoursParam = formData.get('durationHours')

        if (listing.listingType === 'AUCTION') {
            if ((duration && duration !== 'keep') || durationHoursParam) {
                let durationHours = 72 // default 3 days
                if (durationHoursParam) {
                    durationHours = parseFloat(durationHoursParam)
                } else if (duration) {
                    const str = String(duration).trim().toLowerCase()
                    if (str.endsWith('h')) {
                        durationHours = parseFloat(str.replace('h', ''))
                    } else if (str.endsWith('d')) {
                        durationHours = parseFloat(str.replace('d', '')) * 24
                    } else {
                        const num = parseFloat(str)
                        durationHours = num <= 14 ? num * 24 : num
                    }
                }
                data.auctionEndTime = new Date(Date.now() + Math.round(durationHours * 60 * 60 * 1000))
                data.status = 'ACTIVE'
                data.inStock = true
                data.winnerId = null
                data.winnerBidId = null
                if (startingBid !== null && startingBid !== '') {
                    data.currentBid = parseFloat(startingBid)
                }
            } else if (listing.status === 'EXPIRED' || (listing.auctionEndTime && new Date(listing.auctionEndTime) <= new Date())) {
                // If auction was expired/ended and user edited/saved without changing duration, reactivate with 3 days
                data.auctionEndTime = new Date(Date.now() + 72 * 60 * 60 * 1000)
                data.status = 'ACTIVE'
                data.inStock = true
                data.winnerId = null
                data.winnerBidId = null
                if (startingBid !== null && startingBid !== '') {
                    data.currentBid = parseFloat(startingBid)
                }
            }
        }

        // Re-activate listing if stock was restocked and listing was out of stock
        if (data.stock > 0 && listing.status === 'ACTIVE' && !listing.inStock) {
            data.inStock = true
        } else if (listing.listingType === 'FIXED' && data.stock > 0) {
            data.inStock = true
            if (listing.status === 'EXPIRED' || listing.status === 'CANCELLED') {
                data.status = 'ACTIVE'
            }
        }
    } else {
        // Simple JSON update (e.g., toggleStock)
        const body = await request.json()
        const allowedFields = ['name', 'description', 'category', 'price', 'mrp', 'inStock', 'stock', 'status']
        for (const field of allowedFields) {
            if (body[field] !== undefined) data[field] = body[field]
        }
        if (body.stock !== undefined) {
            const numStock = parseInt(body.stock, 10)
            data.stock = isNaN(numStock) ? 0 : Math.max(0, numStock)
            if (body.inStock === undefined) {
                data.inStock = data.stock > 0
            }
        }
        // Reactivate expired/inactive listing when turned on
        if (body.inStock === true) {
            data.inStock = true
            if (listing.status === 'EXPIRED' || listing.status === 'CANCELLED') {
                data.status = 'ACTIVE'
            }
            if (listing.listingType === 'AUCTION') {
                if (!listing.auctionEndTime || new Date(listing.auctionEndTime) <= new Date() || listing.status === 'EXPIRED') {
                    data.auctionEndTime = new Date(Date.now() + 72 * 60 * 60 * 1000)
                    data.status = 'ACTIVE'
                    data.winnerId = null
                    data.winnerBidId = null
                    data.currentBid = listing.startingBid || 0
                    data.bidCount = 0
                }
            }
        }
    }

    const updated = await prisma.listing.update({
        where: { id },
        data,
        include: {
            seller: { select: { id: true, name: true, image: true } },
        },
    })

    return Response.json(updated)
}

// DELETE /api/listings/[id] — Auth required (owner only)
export async function DELETE(request, { params }) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const { user } = authResult

    const listing = await prisma.listing.findUnique({
        where: { id },
        include: { _count: { select: { orderItems: true } } },
    })
    if (!listing) {
        return Response.json({ error: 'Listing not found' }, { status: 404 })
    }
    if (listing.sellerId !== user.id) {
        return Response.json({ error: 'Not your listing' }, { status: 403 })
    }

    if (listing._count.orderItems > 0) {
        // Soft delete if historical orders reference this listing
        await prisma.listing.update({
            where: { id },
            data: { status: 'CANCELLED', inStock: false },
        })
    } else {
        // Hard delete if no orders placed yet
        await prisma.listing.delete({
            where: { id },
        })
    }

    return Response.json({ deleted: true })
}

