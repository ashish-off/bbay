'use client'
import { productDummyData } from "@/assets/assets"
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Image from "next/image"

export default function AdminListings() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'
    const [listings, setListings] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchListings = async () => {
        setListings(productDummyData)
        setLoading(false)
    }

    const toggleListingStatus = (id) => {
        setListings(listings.map(item => {
            if (item.id === id) {
                const nextStatus = !item.inStock
                toast.success(`Listing ${nextStatus ? 'activated' : 'delisted'}`)
                return { ...item, inStock: nextStatus }
            }
            return item
        }))
    }

    useEffect(() => {
        fetchListings()
    }, [])

    return !loading ? (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Moderate <span className="text-slate-800 font-medium">Listings</span></h1>

            {listings.length ? (
                <div className="flex flex-col gap-4 mt-6 max-w-4xl">
                    {listings.map((item) => (
                        <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 flex max-md:flex-col justify-between items-center gap-4 shadow-xs">
                            <div className="flex items-center gap-4">
                                <Image src={item.images[0]} alt={item.name} width={55} height={55} className="w-14 h-14 rounded-lg object-cover border p-1" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-800">{item.name}</h3>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.listingType === 'auction' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                            {item.listingType === 'auction' ? 'AUCTION' : 'FIXED'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400 mt-0.5">{item.category} · Seller: {item.seller?.name || 'bbay user'}</p>
                                    <p className="text-xs font-medium text-slate-700 mt-1">
                                        {item.listingType === 'auction' ? `Current Bid: ${currency}${item.currentBid?.toLocaleString()}` : `Price: ${currency}${item.price?.toLocaleString()}`}
                                    </p>
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500">{item.inStock ? 'Active' : 'Delisted'}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toggleListingStatus(item.id)} checked={item.inStock} />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-3xl text-slate-400 font-medium">No listings available</h1>
                </div>
            )}
        </div>
    ) : <Loading />
}