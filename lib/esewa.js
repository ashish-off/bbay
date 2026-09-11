import crypto from 'crypto'

export function generateEsewaSignature(message) {
    const secret = process.env.ESEWA_SECRET_KEY
    if (!secret) throw new Error('ESEWA_SECRET_KEY not configured')
    return crypto.createHmac('sha256', secret).update(message).digest('base64')
}

export function buildSignatureMessage(totalAmount, transactionUuid, productCode) {
    return `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`
}

export function verifyEsewaResponse(responseData) {
    const { signed_field_names, signature } = responseData
    if (!signed_field_names || !signature) return false

    const fieldNames = signed_field_names.split(',')
    const message = fieldNames.map(f => `${f}=${responseData[f]}`).join(',')
    const expectedSignature = generateEsewaSignature(message)

    return expectedSignature === signature
}
