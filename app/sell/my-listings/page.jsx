'use client'
import { toast } from "react-hot-toast"
import Image from "next/image"
import Link from "next/link"
import Loading from "@/components/Loading"
import CountdownTimer from "@/components/CountdownTimer"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchSellerListings, toggleListingStock } from "@/lib/api"
import { assets } from "@/assets/assets"
import { PlusCircle, ExternalLink } from "lucide-react"

export default function MyListings() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'
    const queryClient = useQueryClient()

    const { data: listings = [], isLoading, error } = useQuery({
        queryKey: ['seller-listings'],
        queryFn: fetchSellerListings,
    })

    const toggleMutation = useMutation({
        mutationFn: toggleListingStock,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-listings'] })
            toast.success("Listing status updated")
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update')
        },
    })

    return (
        <div className="mb-28">
            <div className="flex items-center justify-between mb-5 max-w-5xl">
                <h1 className="text-2xl text-slate-500">My <span className="text-slate-800 font-medium">Listings</span></h1>
                <Link 
                    href="/sell/create-listing" 
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition"
                >
                    <PlusCircle size={16} />
                    New Listing
                </Link>
            </div>

            {isLoading ? (
                <div className="max-w-5xl h-64 flex items-center justify-center border border-slate-200 rounded-lg bg-white">
                    <Loading />
                </div>
            ) : listings.length === 0 ? (
                <div className="max-w-5xl py-16 text-center border border-slate-200 rounded-lg bg-white">
                    <p className="text-slate-500 text-sm">You haven&apos;t created any listings yet.</p>
                    <Link 
                        href="/sell/create-listing" 
                        className="inline-block mt-4 text-indigo-600 font-medium text-sm hover:underline"
                    >
                        Create your first listing &rarr;
                    </Link>
                </div>
            ) : (
                <div className="overflow-x-auto max-w-5xl rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-left text-sm text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-xs border-b border-slate-200">
                            <tr>
                                <th className="px-4 py-3">Item</th>
                                <th className="px-4 py-3">Type</th>
                                <th className="px-4 py-3">Price / Current Bid</th>
                                <th className="px-4 py-3">Time Left</th>
                                <th className="px-4 py-3 text-center">Active</th>
                                <th className="px-4 py-3 text-center">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {listings.map((product) => {
                                const isAuction = product.listingType?.toLowerCase() === 'auction'
                                return (
                                    <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                                        <td className="px-4 py-3">
                                            <div className="flex gap-3 items-center">
                                                <Image 
                                                    width={40} 
                                                    height={40} 
                                                    className='size-10 p-0.5 border border-slate-100 rounded-md object-cover' 
                                                    src={product.images?.[0] || assets.upload_area} 
                                                    alt="" 
                                                />
                                                <div>
                                                    <p className="font-medium text-slate-800">{product.name}</p>
                                                    <p className="text-xs text-slate-400">{product.category}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${isAuction ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                {isAuction ? 'AUCTION' : 'BUY NOW'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-800">
                                            {isAuction ? (
                                                <div>
                                                    <p>{currency} {(product.currentBid || product.startingBid || 0).toLocaleString()}</p>
                                                    <p className="text-xs text-slate-400 font-normal">{product.bidCount || 0} bids</p>
                                                </div>
                                            ) : (
                                                `${currency} ${(product.price || 0).toLocaleString()}`
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            {isAuction && product.auctionEndTime ? (
                                                <CountdownTimer endTime={product.auctionEndTime} compact />
                                            ) : (
                                                <span className="text-xs text-slate-400">Buy It Now</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input 
                                                    type="checkbox" 
                                                    className="sr-only peer" 
                                                    onChange={() => toggleMutation.mutate({ id: product.id, inStock: product.inStock })} 
                                                    checked={Boolean(product.inStock)} 
                                                />
                                                <div className="w-8 h-4 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                                                <span className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                                            </label>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <Link 
                                                href={`/product/${product.id}`}
                                                className="inline-flex items-center text-slate-400 hover:text-indigo-600 transition"
                                                title="View Listing"
                                            >
                                                <ExternalLink size={16} />
                                            </Link>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}