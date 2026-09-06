import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'
import { uploadImage } from '@/lib/imagekit'

// GET /api/listings — Public listing search
export async function GET(request) {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')         // AUCTION | FIXED
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const status = searchParams.get('status') || 'ACTIVE'
    const sort = searchParams.get('sort')         // endingSoon | newest | priceAsc | priceDesc
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')

    const where = { status }

    if (type) where.listingType = type.toUpperCase()
    if (category) where.category = category
    if (search) {
        where.OR = [
            { name: { contains: search, mode: 'insensitive' } },
            { description: { contains: search, mode: 'insensitive' } },
            { category: { contains: search, mode: 'insensitive' } },
        ]
    }

    let orderBy = { createdAt: 'desc' }
    if (sort === 'endingSoon') orderBy = { auctionEndTime: 'asc' }
    else if (sort === 'priceAsc') orderBy = { price: 'asc' }
    else if (sort === 'priceDesc') orderBy = { price: 'desc' }
    else if (sort === 'newest') orderBy = { createdAt: 'desc' }

    const [listings, total] = await Promise.all([
        prisma.listing.findMany({
            where,
            orderBy,
            skip: offset,
            take: limit,
            include: {
                seller: { select: { id: true, name: true, image: true } },
                _count: { select: { bids: true, ratings: true } },
            },
        }),
        prisma.listing.count({ where }),
    ])

    return Response.json({ listings, total, limit, offset })
}

// POST /api/listings — Auth required, create listing with image upload
export async function POST(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const formData = await request.formData()

    // Upload images to ImageKit
    const imageUrls = []
    // Support multi-file upload under 'images'
    const multiFiles = formData.getAll('images')
    if (multiFiles && multiFiles.length > 0) {
        for (const file of multiFiles) {
            if (file && typeof file !== 'string' && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer())
                const result = await uploadImage(buffer, file.name, '/listings')
                imageUrls.push(result.url)
            }
        }
    }
    // Also support individual keys image1, image2, etc.
    if (imageUrls.length === 0) {
        for (let i = 1; i <= 6; i++) {
            const file = formData.get(`image${i}`)
            if (file && typeof file !== 'string' && file.size > 0) {
                const buffer = Buffer.from(await file.arrayBuffer())
                const result = await uploadImage(buffer, file.name, '/listings')
                imageUrls.push(result.url)
            }
        }
    }

    const listingType = formData.get('listingType')?.toUpperCase() || 'FIXED'
    const isAuction = listingType === 'AUCTION'

    // Flexible duration calculation (supports hours and days: 1h, 6h, 12h, 1d, 2d, 3d, 5d, 7d, 10d, 14d)
    let durationHours = 72 // default 3 days
    const durationHoursParam = formData.get('durationHours')
    const rawDuration = formData.get('duration')

    if (durationHoursParam) {
        durationHours = parseFloat(durationHoursParam)
    } else if (rawDuration) {
        const str = String(rawDuration).trim().toLowerCase()
        if (str.endsWith('h')) {
            durationHours = parseFloat(str.replace('h', ''))
        } else if (str.endsWith('d')) {
            durationHours = parseFloat(str.replace('d', '')) * 24
        } else {
            const num = parseFloat(str)
            // If <= 14, interpret as days for backward compatibility, else hours
            durationHours = num <= 14 ? num * 24 : num
        }
    }

    const startingBid = parseFloat(formData.get('startingBid') || '0')
    const buyNowPrice = formData.get('buyNowPrice') ? parseFloat(formData.get('buyNowPrice')) : null

    const data = {
        name: formData.get('name'),
        description: formData.get('description'),
        category: formData.get('category'),
        images: imageUrls,
        listingType,
        sellerId: user.id,

        // Fixed price fields
        price: isAuction ? null : parseFloat(formData.get('price') || '0'),
        mrp: formData.get('mrp') ? parseFloat(formData.get('mrp')) : null,

        // Auction fields
        startingBid: isAuction ? startingBid : null,
        currentBid: isAuction ? startingBid : null,
        buyNowPrice: isAuction ? buyNowPrice : null,
        auctionEndTime: isAuction
            ? new Date(Date.now() + Math.round(durationHours * 60 * 60 * 1000))
            : null,
    }

    const listing = await prisma.listing.create({
        data,
        include: {
            seller: { select: { id: true, name: true, image: true } },
        },
    })

    return Response.json(listing, { status: 201 })
}
