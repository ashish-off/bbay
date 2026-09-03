'use client'
import { useSelector } from 'react-redux'

const BidHistory = ({ productId }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'
    const allBids = useSelector(state => state.bid.bidHistory)
    const bids = allBids.filter(b => b.productId === productId)

    if (bids.length === 0) {
        return <p className="text-slate-400 text-sm mt-4">No bids yet. Be the first to bid!</p>
    }

    return (
        <div className="mt-4 max-w-lg">
            <table className="w-full text-sm text-left">
                <thead>
                    <tr className="text-slate-500 border-b border-slate-200">
                        <th className="py-2 font-medium">Bidder</th>
                        <th className="py-2 font-medium">Amount</th>
                        <th className="py-2 font-medium">Time</th>
                    </tr>
                </thead>
                <tbody>
                    {bids.slice(0, 10).map((bid, i) => (
                        <tr key={bid.id} className={`border-b border-slate-100 ${i === 0 ? 'bid-flash' : ''}`}>
                            <td className="py-2.5 text-slate-600">{bid.userName}</td>
                            <td className="py-2.5 font-medium text-slate-800">{currency}{bid.amount.toLocaleString()}</td>
                            <td className="py-2.5 text-slate-400 text-xs">{new Date(bid.createdAt).toLocaleString()}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            {bids.length > 10 && (
                <p className="text-xs text-slate-400 mt-2">Showing 10 of {bids.length} bids</p>
            )}
        </div>
    )
}

export default BidHistory
