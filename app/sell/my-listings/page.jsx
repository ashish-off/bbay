'use client'
import { toast } from "react-hot-toast"
import Image from "next/image"
import Loading from "@/components/Loading"
import CountdownTimer from "@/components/CountdownTimer"
import { useSelector, useDispatch } from "react-redux"
import { toggleProductStock } from "@/lib/features/product/productSlice"

export default function MyListings() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'
    const dispatch = useDispatch()
    const products = useSelector(state => state.product.list)

    const toggleStatus = (productId) => {
        dispatch(toggleProductStock({ productId }))
        toast.success("Listing status updated")
    }

    return (
        <div className="mb-28">
            <h1 className="text-2xl text-slate-500 mb-5">My <span className="text-slate-800 font-medium">Listings</span></h1>
            <div className="overflow-x-auto max-w-5xl rounded-lg border border-slate-200 bg-white">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 uppercase tracking-wider text-xs border-b border-slate-200">
                        <tr>
                            <th className="px-4 py-3">Item</th>
                            <th className="px-4 py-3">Type</th>
                            <th className="px-4 py-3">Price / Current Bid</th>
                            <th className="px-4 py-3">Time Left</th>
                            <th className="px-4 py-3 text-center">Active</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {products.map((product) => (
                            <tr key={product.id} className="hover:bg-slate-50/80 transition-colors">
                                <td className="px-4 py-3">
                                    <div className="flex gap-3 items-center">
                                        <Image width={40} height={40} className='p-1 border border-slate-100 rounded-md object-cover' src={product.images?.[0] || ''} alt="" />
                                        <div>
                                            <p className="font-medium text-slate-800">{product.name}</p>
                                            <p className="text-xs text-slate-400">{product.category}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-4 py-3">
                                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${product.listingType === 'auction' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                        {product.listingType === 'auction' ? 'AUCTION' : 'BUY NOW'}
                                    </span>
                                </td>
                                <td className="px-4 py-3 font-medium text-slate-800">
                                    {product.listingType === 'auction' ? (
                                        <div>
                                            <p>{currency} {product.currentBid?.toLocaleString()}</p>
                                            <p className="text-xs text-slate-400 font-normal">{product.bidCount || 0} bids</p>
                                        </div>
                                    ) : (
                                        `${currency} ${product.price.toLocaleString()}`
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    {product.listingType === 'auction' && product.auctionEndTime ? (
                                        <CountdownTimer endTime={product.auctionEndTime} compact />
                                    ) : (
                                        <span className="text-xs text-slate-400">Buy It Now</span>
                                    )}
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input type="checkbox" className="sr-only peer" onChange={() => toggleStatus(product.id)} checked={product.inStock} />
                                        <div className="w-8 h-4 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                                        <span className="absolute left-0.5 top-0.5 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                                    </label>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}