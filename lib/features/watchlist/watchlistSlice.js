import { createSlice } from '@reduxjs/toolkit'

const watchlistSlice = createSlice({
    name: 'watchlist',
    initialState: {
        items: [], // array of productIds
    },
    reducers: {
        toggleWatchlist: (state, action) => {
            const { productId } = action.payload
            const index = state.items.indexOf(productId)
            if (index >= 0) {
                state.items.splice(index, 1)
            } else {
                state.items.push(productId)
            }
        },
        setWatchlist: (state, action) => {
            state.items = action.payload || []
        },
        clearWatchlist: (state) => {
            state.items = []
        }
    }
})

export const { toggleWatchlist, setWatchlist, clearWatchlist } = watchlistSlice.actions

export default watchlistSlice.reducer
