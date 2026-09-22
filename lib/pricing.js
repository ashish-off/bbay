export const DELIVERY_FEE = 100
export const COD_FEE = 20

// Calculate order billing with delivery fee (Rs 100) and payment fee (COD Rs 20, Pay Now Rs 0)
export function calculateOrderBilling({ subtotal = 0, discountPercent = 0, paymentMethod = 'COD' }) {
    const safeSubtotal = Math.max(0, Number(subtotal) || 0)
    const discountAmount = discountPercent > 0 ? Math.round((discountPercent / 100) * safeSubtotal) : 0
    const discountedSubtotal = Math.max(0, safeSubtotal - discountAmount)
    const deliveryFee = DELIVERY_FEE
    const paymentFee = paymentMethod === 'COD' ? COD_FEE : 0
    const finalTotal = discountedSubtotal + deliveryFee + paymentFee

    return {
        subtotal: safeSubtotal,
        discountPercent,
        discountAmount,
        discountedSubtotal,
        deliveryFee,
        paymentFee,
        finalTotal,
        isCod: paymentMethod === 'COD',
    }
}
