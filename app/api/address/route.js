import prisma from '@/lib/prisma'
import { getAuthUser } from '@/lib/auth'

// GET /api/address — Auth required
export async function GET() {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult

    const addresses = await prisma.address.findMany({
        where: { userId: user.id },
        orderBy: { createdAt: 'desc' },
    })

    return Response.json(addresses)
}

// POST /api/address — Auth required, add address
export async function POST(request) {
    const authResult = await getAuthUser()
    if (!authResult) return Response.json({ error: 'Unauthorized' }, { status: 401 })

    const { user } = authResult
    const body = await request.json()

    const required = ['name', 'email', 'street', 'city', 'state', 'zip', 'country', 'phone']
    for (const field of required) {
        if (!body[field]) {
            return Response.json({ error: `${field} is required` }, { status: 400 })
        }
    }

    const address = await prisma.address.create({
        data: {
            userId: user.id,
            name: body.name,
            email: body.email,
            street: body.street,
            city: body.city,
            state: body.state,
            zip: body.zip,
            country: body.country,
            phone: body.phone,
        },
    })

    return Response.json(address, { status: 201 })
}
