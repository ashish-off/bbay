'use client'
import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useUser, useClerk } from '@clerk/nextjs'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { placeBid } from '@/lib/api'

const BidInput = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'
    const { user } = useUser()
    const { openSignIn } = useClerk()
    const queryClient = useQueryClient()

    const minBid = (product.currentBid || product.startingBid || 0) + 100
    const [bidAmount, setBidAmount] = useState(minBid)
    const [showConfirm, setShowConfirm] = useState(false)

    useEffect(() => {
        setBidAmount((product.currentBid || product.startingBid || 0) + 100)
    }, [product.currentBid, product.startingBid])

    const mutation = useMutation({
        mutationFn: placeBid,
        onSuccess: (newBid) => {
            queryClient.invalidateQueries({ queryKey: ['listing', product.id] })
            queryClient.invalidateQueries({ queryKey: ['bids', product.id] })
            toast.success(`Bid of ${currency}${bidAmount.toLocaleString()} placed!`)
            setShowConfirm(false)
            setBidAmount(bidAmount + 100)
        },
        onError: (err) => {
            setShowConfirm(false)
            if (err.status === 401) {
                toast.error('Please sign in to place a bid')
                openSignIn()
            } else {
                toast.error(err.message || 'Failed to place bid')
            }
        },
    })

    const handlePlaceBid = () => {
        if (!user) {
            toast.error('Please sign in to place a bid')
            openSignIn()
            return
        }
        if (product.sellerId === user.id) {
            return toast.error('You cannot bid on your own listing')
        }
        if (bidAmount < minBid) {
            return toast.error(`Minimum bid is ${currency}${minBid.toLocaleString()}`)
        }
        setShowConfirm(true)
    }

    const confirmBid = () => {
        mutation.mutate({
            listingId: product.id,
            amount: bidAmount,
        })
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
                        disabled={mutation.isPending}
                        className="bg-indigo-600 disabled:bg-indigo-400 text-white px-8 py-2.5 text-sm font-medium rounded-md hover:bg-indigo-700 active:scale-95 transition"
                    >
                        {mutation.isPending ? 'Placing...' : 'Place Bid'}
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
                            <button 
                                onClick={() => setShowConfirm(false)} 
                                disabled={mutation.isPending}
                                className="flex-1 py-2 bg-slate-100 text-slate-600 rounded-md hover:bg-slate-200 transition"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmBid} 
                                disabled={mutation.isPending}
                                className="flex-1 py-2 bg-indigo-600 disabled:bg-indigo-400 text-white rounded-md hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                            >
                                {mutation.isPending ? 'Confirming...' : 'Confirm Bid'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default BidInput
