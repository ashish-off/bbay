import axios from 'axios'

/** Check if currently authenticated user has admin privileges */
export async function checkAdminStatus() {
    try {
        const { data } = await axios.get('/api/admin/check')
        return data
    } catch {
        return { isAdmin: false }
    }
}

/** Fetch a single listing by ID */
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

/** Fetch bids for a listing */
export async function fetchListingBids(listingId) {
    try {
        const { data } = await axios.get('/api/bids', { params: { listingId } })
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch bids')
    }
}

/** Create a new listing with FormData (images + fields) */
export async function createListing(formData) {
    try {
        const { data } = await axios.post('/api/listings', formData)
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to create listing')
    }
}

/** Place a bid on an auction listing */
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

/** Fetch listings created by the authenticated seller */
export async function fetchSellerListings() {
    try {
        const { data } = await axios.get('/api/seller/listings')
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to fetch your listings')
    }
}

/** Toggle listing active stock status */
export async function toggleListingStock({ id, inStock }) {
    try {
        const { data } = await axios.put(`/api/listings/${id}`, { inStock: !inStock })
        return data
    } catch (err) {
        throw new Error(err.response?.data?.error || 'Failed to update listing')
    }
}

/** Fetch public listings with optional filters */
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
