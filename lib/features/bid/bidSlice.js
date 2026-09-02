import { createSlice } from '@reduxjs/toolkit'
import { dummyBidHistory } from '@/assets/assets'

const bidSlice = createSlice({
    name: 'bid',
    initialState: {
        myBids: [],
        bidHistory: dummyBidHistory,
    },
    reducers: {
        placeBid: (state, action) => {
            const { productId, amount, userName } = action.payload
            const newBid = {
                id: `bid_${Date.now()}`,
                userId: 'user_1',
                userName,
                amount,
                productId,
                createdAt: new Date().toISOString(),
            }
            state.bidHistory.unshift(newBid)
            state.myBids.unshift(newBid)
        },
        clearBids: (state) => {
            state.myBids = []
            state.bidHistory = []
        }
    }
})

export const { placeBid, clearBids } = bidSlice.actions

export default bidSlice.reducer
