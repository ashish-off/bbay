'use client'
import { StarIcon } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import BidHistory from "./BidHistory"
import { assets } from "@/assets/assets"

const ProductDescription = ({ product }) => {

    const isAuction = product.listingType?.toLowerCase() === 'auction'
    const tabs = isAuction ? ['Description', 'Reviews', 'Bid History'] : ['Description', 'Reviews']
    const [selectedTab, setSelectedTab] = useState('Description')
    const reviews = product.ratings || product.rating || []

    return (
        <div className="my-18 text-sm text-slate-600">

            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {tabs.map((tab, index) => (
                    <button className={`${tab === selectedTab ? 'border-b-[1.5px] border-indigo-600 text-indigo-600 font-semibold' : 'text-slate-400'} px-3 py-2 font-medium transition`} key={index} onClick={() => setSelectedTab(tab)}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <p className="max-w-xl leading-relaxed whitespace-pre-line">{product.description}</p>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="flex flex-col gap-3 mt-8">
                    {reviews.length === 0 ? (
                        <p className="text-slate-400 text-sm">No reviews yet for this listing.</p>
                    ) : (
                        reviews.map((item, index) => (
                            <div key={index} className="flex gap-5 mb-8">
                                <Image src={item.user?.image || assets.gs_logo} alt="" className="size-10 rounded-full" width={40} height={40} />
                                <div>
                                    <div className="flex items-center" >
                                        {Array(5).fill('').map((_, idx) => (
                                            <StarIcon key={idx} size={18} className='text-transparent mt-0.5' fill={item.rating >= idx + 1 ? "#00C950" : "#D1D5DB"} />
                                        ))}
                                    </div>
                                    <p className="text-sm max-w-lg my-3">{item.review}</p>
                                    <p className="font-medium text-slate-800">{item.user?.name || 'Verified Buyer'}</p>
                                    <p className="mt-1 font-light text-xs text-slate-400">{new Date(item.createdAt).toDateString()}</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* Bid History */}
            {selectedTab === "Bid History" && isAuction && (
                <BidHistory productId={product.id} />
            )}

            {/* Seller Info (No store) */}
            {product.seller && (
                <div className="flex items-center gap-3 mt-14 pt-6 border-t border-slate-200">
                    <Image src={product.seller.image || assets.gs_logo} alt="" className="size-11 rounded-full ring ring-slate-200 object-cover" width={44} height={44} />
                    <div>
                        <p className="font-medium text-slate-700">Listed by {product.seller.name}</p>
                        <p className="text-xs text-slate-400">Verified Seller on bbay</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDescription