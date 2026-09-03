'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'
import { useDispatch } from 'react-redux'
import { placeBid } from '@/lib/features/bid/bidSlice'
import { updateAuctionBid } from '@/lib/features/product/productSlice'

const BidInput = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'
    const dispatch = useDispatch()
    const minBid = (product.currentBid || product.startingBid || 0) + 100
    const [bidAmount, setBidAmount] = useState(minBid)
    const [showConfirm, setShowConfirm] = useState(false)

    const handlePlaceBid = () => {
        if (bidAmount < minBid) {
            return toast.error(`Minimum bid is ${currency}${minBid.toLocaleString()}`)
        }
        setShowConfirm(true)
    }

    const confirmBid = () => {
        // Update bid slice
        dispatch(placeBid({
            productId: product.id,
            amount: bidAmount,
            userName: 'R***m B.',
        }))
        // Update product state in Redux
        dispatch(updateAuctionBid({
            productId: product.id,
            amount: bidAmount,
        }))
        toast.success(`Bid of ${currency}${bidAmount.toLocaleString()} placed!`)
        setShowConfirm(false)
        setBidAmount(bidAmount + 100)
    }

    return (
        <>
            <div className="flex flex-col gap-3">
                <p className="text-sm text-slate-500">Your Bid (min {currency}{minBid.toLocaleString()})</p>
                <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-300 rounded-md overflow-hidden">
                        <span className="px-3 py-2.5 bg-slate-100 text-slate-500 text-sm">{currency}</span>
                        <input
                            type="number"
                            min={minBid}
                            step={100}
                            value={bidAmount}
                            onChange={(e) => setBidAmount(Number(e.target.value))}
                            className="w-32 px-3 py-2.5 outline-none text-sm"
                        />
                    </div>
                    <button
                        onClick={handlePlaceBid}
                        className="bg-indigo-600 text-white px-8 py-2.5 text-sm font-medium rounded-md hover:bg-indigo-700 active:scale-95 transition"
                    >
                        Place Bid
                    </button>
                </div>
            </div>

            {/* Confirm Modal */}
            {showConfirm && (
                <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-xs flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full mx-4">
                        <h3 className="text-lg font-semibold text-slate-800">Confirm Your Bid</h3>
                        <p className="text-sm text-slate-500 mt-2">
                            You are about to bid <span className="font-semibold text-slate-800">{currency}{bidAmount.toLocaleString()}</span> on <span className="font-medium">{product.name}</span>.
                        </p>
                        <p className="text-xs text-slate-400 mt-2">This action cannot be undone.</p>
                        <div className="flex gap-3 mt-5">
                            <button onClick={() => setShowConfirm(false)} className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition">Cancel</button>
                            <button onClick={confirmBid} className="flex-1 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition">Confirm Bid</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default BidInput
