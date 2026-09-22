'use client'
import { useQuery } from '@tanstack/react-query'
import { fetchListingBids } from '@/lib/api'

const BidHistory = ({ productId }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'

    const { data: bids = [], isLoading } = useQuery({
        queryKey: ['bids', productId],
        queryFn: () => fetchListingBids(productId),
        enabled: Boolean(productId),
    })

    if (isLoading) {
        return <p className="text-slate-400 text-sm mt-4 animate-pulse">Loading bids...</p>
    }

    if (bids.length === 0) {
        return <p className="text-slate-400 text-sm mt-4">No bids yet. Be the first to bid!</p>
    }

    const maskName = (name) => {
        if (!name) return 'Anonymous'
        if (name.length <= 2) return name
        return `${name[0]}***${name[name.length - 1]}`
    }

    return (
        <div className="mt-4 max-w-lg">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-700">
                    Total Bids: <span className="text-indigo-600 font-bold">({bids.length})</span>
                </span>
            </div>
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
                        <tr key={bid.id} className={`border-b border-slate-100 ${i === 0 ? 'bid-flash bg-indigo-50/40' : ''}`}>
                            <td className="py-2.5 text-slate-600 font-medium">
                                {maskName(bid.bidder?.name || bid.userName)}
                            </td>
                            <td className="py-2.5 font-semibold text-slate-800">
                                {currency}{bid.amount?.toLocaleString()}
                            </td>
                            <td className="py-2.5 text-slate-400 text-xs">
                                {new Date(bid.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}, {new Date(bid.createdAt).toLocaleDateString()}
                            </td>
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
