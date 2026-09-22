import axios from 'axios'

// ─── Client Cache Storage Helper ────────────────────────────────────
export const clientCache = {
    get(key) {
        if (typeof window === 'undefined') return null
        try {
            const raw = localStorage.getItem(`bbay_cache_${key}`)
            if (!raw) return null
            const item = JSON.parse(raw)
            if (item.expiry && Date.now() > item.expiry) {
                localStorage.removeItem(`bbay_cache_${key}`)
                return null
            }
            return item.data
        } catch {
            return null
        }
    },
    set(key, data, ttlMs = 5 * 60 * 1000) {
        if (typeof window === 'undefined') return
        try {
            const item = {
                data,
                expiry: Date.now() + ttlMs,
            }
            localStorage.setItem(`bbay_cache_${key}`, JSON.stringify(item))
        } catch {
            // Storage full or unavailable
        }
    },
    remove(key) {
        if (typeof window === 'undefined') return
        try {
            localStorage.removeItem(`bbay_cache_${key}`)
        } catch {}
    },
}

// ─── Auth & Admin ───────────────────────────────────────────────────
export async function checkAdminStatus() {
    try {
        const { data } = await axios.get('/api/admin/check')
        return data
    } catch {
        return { isAdmin: false }
    }
}

// ─── Listings ───────────────────────────────────────────────────────
export async function fetchListings({ type, category, search, sort, limit = 20, offset = 0 } = {}) {
    try {
        const params = {}
        if (type) params.type = type
        if (category) params.category = category
        if (search) params.search = search
        if (sort) params.sort = sort
        if (limit) params.limit = limit
        if (offset) params.offset = offset

        const { data } = await axios.get('/api/listings', { params })
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch listings')
    }
}

export async function fetchListing(id) {
    try {
        const { data } = await axios.get(`/api/listings/${id}`)
        return data
    } catch (err) {
        const message = err.response?.data?.error || err.message || 'Failed to fetch listing'
        const error = new Error(message)
        error.status = err.response?.status
        throw error
    }
}

export async function createListing(formData) {
    try {
        const { data } = await axios.post('/api/listings', formData)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to create listing')
    }
}

export async function fetchSellerListings() {
    try {
        const { data } = await axios.get('/api/seller/listings')
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch your listings')
    }
}

export async function fetchSellerDashboard() {
    try {
        const { data } = await axios.get('/api/seller/dashboard')
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch seller dashboard')
    }
}

export async function toggleListingStock({ id, inStock }) {
    try {
        const { data } = await axios.put(`/api/listings/${id}`, { inStock: !inStock })
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to update listing')
    }
}

export async function updateListing({ id, formData }) {
    try {
        const { data } = await axios.put(`/api/listings/${id}`, formData)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to update listing')
    }
}

export async function deleteListing(id) {
    try {
        const { data } = await axios.delete(`/api/listings/${id}`)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to delete listing')
    }
}


// ─── Bids ───────────────────────────────────────────────────────────
export async function fetchListingBids(listingId) {
    try {
        const { data } = await axios.get('/api/bids', { params: { listingId } })
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch bids')
    }
}

export async function placeBid({ listingId, amount }) {
    try {
        const { data } = await axios.post('/api/bids', { listingId, amount })
        return data
    } catch (err) {
        const error = new Error(err.response?.data?.error || 'Failed to place bid')
        error.status = err.response?.status
        throw error
    }
}

// ─── Cart ───────────────────────────────────────────────────────────
export async function fetchCart() {
    try {
        const { data } = await axios.get('/api/cart')
        clientCache.set('cart_items', data.items, 2 * 60 * 1000)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch cart')
    }
}

export async function addToCartApi({ listingId, quantity = 1 }) {
    try {
        const { data } = await axios.post('/api/cart', { listingId, quantity })
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to add item to cart')
    }
}

export async function updateCartQtyApi({ listingId, quantity }) {
    try {
        const { data } = await axios.put('/api/cart', { listingId, quantity })
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to update cart quantity')
    }
}

export async function removeFromCartApi(listingId) {
    try {
        const { data } = await axios.delete(`/api/cart?listingId=${listingId}`)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to remove from cart')
    }
}

export async function clearCartApi() {
    try {
        const { data } = await axios.delete('/api/cart')
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to clear cart')
    }
}

// ─── Watchlist ──────────────────────────────────────────────────────
export async function fetchWatchlist() {
    try {
        const { data } = await axios.get('/api/watchlist')
        clientCache.set('watchlist', data, 5 * 60 * 1000)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch watchlist')
    }
}

export async function toggleWatchlistApi(listingId) {
    try {
        const { data } = await axios.post('/api/watchlist', { listingId })
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to update watchlist')
    }
}

// ─── Addresses ──────────────────────────────────────────────────────
export async function fetchAddresses() {
    try {
        const { data } = await axios.get('/api/address')
        clientCache.set('addresses', data, 10 * 60 * 1000)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch addresses')
    }
}

export async function createAddressApi(addressData) {
    try {
        const { data } = await axios.post('/api/address', addressData)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to save address')
    }
}

// ─── Ratings & Reviews ──────────────────────────────────────────────
export async function fetchRatings(listingId) {
    try {
        const { data } = await axios.get(`/api/ratings?listingId=${listingId}`)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch ratings')
    }
}

export async function createRatingApi({ listingId, orderId, rating, review }) {
    try {
        const { data } = await axios.post('/api/ratings', { listingId, orderId, rating, review })
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to submit review')
    }
}

// ─── Orders ─────────────────────────────────────────────────────────
export async function fetchUserOrders() {
    try {
        const { data } = await axios.get('/api/orders')
        clientCache.set('user_orders', data, 3 * 60 * 1000)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch orders')
    }
}

export async function createOrderApi({ addressId, paymentMethod, couponCode }) {
    try {
        const { data } = await axios.post('/api/orders', { addressId, paymentMethod, couponCode })
        clientCache.remove('cart_items')
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to place order')
    }
}

export async function initiateEsewaPayment({ addressId, couponCode }) {
    try {
        const { data } = await axios.post('/api/esewa/initiate', { addressId, couponCode })
        clientCache.remove('cart_items')
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to initiate eSewa payment')
    }
}

export async function fetchSellerOrders() {
    try {
        const { data } = await axios.get('/api/seller/orders')
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch seller orders')
    }
}

export async function updateSellerOrderStatus({ orderId, status }) {
    try {
        const { data } = await axios.put(`/api/seller/orders/${orderId}`, { status })
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to update order status')
    }
}

// ─── Auction Orders & Won Auctions ──────────────────────────────────
export async function fetchWonAuctions() {
    try {
        const { data } = await axios.get('/api/auction/won')
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch won auctions')
    }
}

export async function createAuctionOrder({ listingId, addressId, paymentMethod, couponCode }) {
    try {
        const { data } = await axios.post('/api/auction/checkout', { listingId, addressId, paymentMethod, couponCode })
        clientCache.remove('user_orders')
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to place auction order')
    }
}

export async function initiateAuctionEsewaPayment({ listingId, addressId, couponCode }) {
    try {
        const { data } = await axios.post('/api/auction/esewa-initiate', { listingId, addressId, couponCode })
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to initiate eSewa payment for auction')
    }
}

// ─── Coupons ────────────────────────────────────────────────────────
export async function fetchCoupons() {
    try {
        const { data } = await axios.get('/api/coupons')
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch coupons')
    }
}

export async function validateCouponApi(code) {
    try {
        const { data } = await axios.post('/api/coupons/validate', { code })
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Invalid or expired coupon')
    }
}

export async function createCouponApi(couponData) {
    try {
        const { data } = await axios.post('/api/coupons', couponData)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to create coupon')
    }
}

export async function deleteCouponApi(code) {
    try {
        const { data } = await axios.delete(`/api/coupons/${code}`)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to delete coupon')
    }
}

// ─── Admin Endpoints ────────────────────────────────────────────────
export async function fetchAdminDashboard() {
    try {
        const { data } = await axios.get('/api/admin/dashboard')
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch dashboard metrics')
    }
}

export async function fetchAdminUsers() {
    try {
        const { data } = await axios.get('/api/admin/users')
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch users')
    }
}

export async function toggleUserActiveApi(arg) {
    try {
        const userId = typeof arg === 'object' ? (arg.userId || arg.id) : arg
        const payload = typeof arg === 'object' && arg.isActive !== undefined ? { isActive: arg.isActive } : {}
        const { data } = await axios.put(`/api/admin/users/${userId}`, payload)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to update user status')
    }
}

export async function fetchAdminListings() {
    try {
        const { data } = await axios.get('/api/admin/listings')
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch admin listings')
    }
}

export async function toggleAdminListingStock(arg) {
    try {
        const listingId = typeof arg === 'object' ? (arg.listingId || arg.id) : arg
        const payload = typeof arg === 'object' ? { status: arg.status, inStock: arg.inStock } : {}
        const { data } = await axios.put(`/api/admin/listings/${listingId}`, payload)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to update listing status')
    }
}


