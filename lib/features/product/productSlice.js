import { createSlice } from '@reduxjs/toolkit'
import { productDummyData } from '@/assets/assets'

const productSlice = createSlice({
    name: 'product',
    initialState: {
        list: productDummyData,
    },
    reducers: {
        setProduct: (state, action) => {
            state.list = action.payload
        },
        addProduct: (state, action) => {
            state.list.unshift(action.payload)
        },
        toggleProductStock: (state, action) => {
            const { productId } = action.payload
            const item = state.list.find(p => p.id === productId)
            if (item) {
                item.inStock = !item.inStock
            }
        },
        buyNowAuction: (state, action) => {
            const { productId } = action.payload
            const item = state.list.find(p => p.id === productId)
            if (item) {
                item.inStock = false // sold out via Buy It Now
            }
        },
        updateAuctionBid: (state, action) => {
            const { productId, amount } = action.payload
            const item = state.list.find(p => p.id === productId)
            if (item) {
                item.currentBid = amount
                item.bidCount = (item.bidCount || 0) + 1
            }
        },
        clearProduct: (state) => {
            state.list = []
        }
    }
})

export const { 
    setProduct, 
    addProduct, 
    toggleProductStock, 
    buyNowAuction, 
    updateAuctionBid, 
    clearProduct 
} = productSlice.actions

export default productSlice.reducer