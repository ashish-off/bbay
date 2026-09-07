'use client'
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchAdminListings, toggleAdminListingStock } from "@/lib/api"
import { CheckCircle2, XCircle, AlertCircle, ShoppingBag } from "lucide-react"

export default function AdminListings() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'
    const queryClient = useQueryClient()

    const { data: listings = [], isLoading, error } = useQuery({
        queryKey: ['admin-listings'],
        queryFn: fetchAdminListings,
    })

    const statusMutation = useMutation({
        mutationFn: toggleAdminListingStock,
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['admin-listings'] })
            queryClient.invalidateQueries({ queryKey: ['listings'] })
            const isActive = updated.status === 'ACTIVE' && updated.inStock
            toast.success(`Listing set to ${isActive ? 'ACTIVE' : updated.status}`)
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update listing status')
        }
    })

    const handleToggle = (listing) => {
        const isCurrentlyActive = listing.status === 'ACTIVE' && listing.inStock
        statusMutation.mutate({
            id: listing.id,
            status: isCurrentlyActive ? 'CANCELLED' : 'ACTIVE',
            inStock: !isCurrentlyActive,
        })
    }

    const handleSelectStatus = (listingId, newStatus) => {
        statusMutation.mutate({
            id: listingId,
            status: newStatus,
            inStock: newStatus === 'ACTIVE',
        })
    }

    if (isLoading) return <Loading />

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
                <p className="font-semibold">Failed to load listings</p>
                <p className="text-xs text-red-400 mt-1">{error.message}</p>
            </div>
        )
    }

    const getStatusBadge = (status, inStock) => {
        const isActive = status === 'ACTIVE' && inStock
        if (isActive) {
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                    <CheckCircle2 size={12} /> ACTIVE
                </span>
            )
        }
        if (status === 'SOLD') {
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
                    <ShoppingBag size={12} /> SOLD
                </span>
            )
        }
        if (status === 'EXPIRED') {
            return (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-700">
                    <AlertCircle size={12} /> EXPIRED
                </span>
            )
        }
        return (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                <XCircle size={12} /> DEACTIVATED
            </span>
        )
    }

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Moderate <span className="text-slate-800 font-medium">Listings</span></h1>
            <p className="text-xs text-slate-400 mt-1">Set listing status (Active, Deactivated, Expired, Sold) and toggle visibility</p>

            {listings.length ? (
                <div className="flex flex-col gap-4 mt-6 max-w-4xl">
                    {listings.map((item) => {
                        const isLive = item.status === 'ACTIVE' && item.inStock

                        return (
                            <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex max-md:flex-col justify-between items-center gap-4 shadow-xs hover:border-slate-300 transition">
                                <div className="flex items-center gap-4">
                                    <div className="relative size-16 rounded-xl bg-slate-50 border border-slate-200/80 overflow-hidden shrink-0">
                                        <Image 
                                            src={item.images?.[0] || '/placeholder.png'} 
                                            alt={item.name} 
                                            fill 
                                            sizes="64px"
                                            className="object-contain p-1" 
                                        />
                                    </div>
                                    <div>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <Link href={`/product/${item.id}`} className="font-semibold text-slate-800 hover:text-indigo-600 transition">
                                                {item.name}
                                            </Link>
                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.listingType === 'AUCTION' ? 'bg-indigo-100 text-indigo-700' : 'bg-purple-100 text-purple-700'}`}>
                                                {item.listingType}
                                            </span>
                                            {getStatusBadge(item.status, item.inStock)}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1">
                                            {item.category} · Seller: <strong>{item.seller?.name || item.seller?.email || 'Seller'}</strong>
                                        </p>
                                        <p className="text-xs font-semibold text-slate-700 mt-1">
                                            {item.listingType === 'AUCTION'
                                                ? `Current Bid: ${currency}${(item.currentBid || item.startingBid || 0).toLocaleString()} · Bids: ${item._count?.bids ?? 0}`
                                                : `Price: ${currency}${(item.price || 0).toLocaleString()} · Orders: ${item._count?.orderItems ?? 0}`}
                                        </p>
                                    </div>
                                </div>

                                {/* Controls: Status Selector & Toggle Switch */}
                                <div className="flex items-center gap-4">
                                    {/* Direct Status Dropdown */}
                                    <select
                                        value={item.status}
                                        onChange={(e) => handleSelectStatus(item.id, e.target.value)}
                                        disabled={statusMutation.isPending}
                                        className="border border-slate-200 bg-white text-xs font-semibold rounded-lg p-2 outline-none focus:border-indigo-500 cursor-pointer"
                                    >
                                        <option value="ACTIVE">ACTIVE (Live in store)</option>
                                        <option value="CANCELLED">CANCELLED (Deactive)</option>
                                        <option value="EXPIRED">EXPIRED (Auction closed)</option>
                                        <option value="SOLD">SOLD (Purchased)</option>
                                    </select>

                                    {/* 1-Click Quick Toggle Switch */}
                                    <div className="flex items-center gap-2">
                                        <label className="relative inline-flex items-center cursor-pointer" title={isLive ? "Click to deactivate" : "Click to activate"}>
                                            <input 
                                                type="checkbox" 
                                                className="sr-only peer" 
                                                onChange={() => handleToggle(item)} 
                                                checked={Boolean(isLive)} 
                                                disabled={statusMutation.isPending}
                                            />
                                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-emerald-600 transition-colors"></div>
                                            <span className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow-xs"></span>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-2xl text-slate-400 font-medium">No listings found in database</h1>
                </div>
            )}
        </div>
    )
}