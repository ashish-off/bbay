import { Webhook } from 'svix'
import { inngest } from '@/inngest/client'

export async function POST(request) {
    const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET

    if (!WEBHOOK_SECRET) {
        return Response.json(
            { error: 'CLERK_WEBHOOK_SECRET not configured' },
            { status: 500 }
        )
    }

    // Get svix headers
    const svix_id = request.headers.get('svix-id')
    const svix_timestamp = request.headers.get('svix-timestamp')
    const svix_signature = request.headers.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
        return Response.json({ error: 'Missing svix headers' }, { status: 400 })
    }

    const body = await request.text()

    // Verify webhook signature
    let evt
    try {
        const wh = new Webhook(WEBHOOK_SECRET)
        evt = wh.verify(body, {
            'svix-id': svix_id,
            'svix-timestamp': svix_timestamp,
            'svix-signature': svix_signature,
        })
    } catch (err) {
        console.error('Webhook verification failed:', err.message)
        return Response.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const eventType = evt.type // 'user.created' | 'user.updated' | 'user.deleted'

    // Send to Inngest for durable background processing
    await inngest.send({
        name: 'clerk/user.synced',
        data: {
            type: eventType,
            clerkUser: evt.data,
        },
    })

    return Response.json({ received: true, type: eventType })
}
