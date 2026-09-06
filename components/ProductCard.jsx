'use client'
import { StarIcon, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import CountdownTimer from './CountdownTimer'
import { useDispatch, useSelector } from 'react-redux'
import { toggleWatchlist } from '@/lib/features/watchlist/watchlistSlice'
import toast from 'react-hot-toast'
import { assets } from '@/assets/assets'

const ProductCard = ({ product }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'
    const dispatch = useDispatch()
    const watchlist = useSelector(state => state.watchlist.items)
    const isWatched = watchlist.includes(product.id)

    const reviews = product.ratings || product.rating || []
    const rating = reviews.length 
        ? Math.round(reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length) 
        : 5

    const isAuction = product.listingType?.toLowerCase() === 'auction'

    const handleWatchlistClick = (e) => {
        e.preventDefault()
        e.stopPropagation()
        dispatch(toggleWatchlist({ productId: product.id }))
        if (isWatched) {
            toast('Removed from watchlist', { icon: '💔' })
        } else {
            toast.success('Added to watchlist!')
        }
    }

    return (
        <Link href={`/product/${product.id}`} className='group w-full max-w-[240px] max-xl:mx-auto relative flex flex-col'>
            {/* Consistent aspect-square container */}
            <div className='relative bg-[#F8FAFC] w-full aspect-square rounded-xl flex items-center justify-center overflow-hidden border border-slate-200/60 shadow-2xs'>
                <Image 
                    src={product.images?.[0] || assets.upload_area} 
                    alt={product.name || 'Product'} 
                    fill
                    sizes="(max-width: 640px) 50vw, 240px"
                    className='object-contain p-3 group-hover:scale-105 transition-transform duration-300' 
                />
                
                {/* Listing type badge */}
                <span className={`absolute top-2.5 left-2.5 text-[10px] font-semibold px-2 py-0.5 rounded-full z-10 ${isAuction ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {isAuction ? '🔨 AUCTION' : '🛒 BUY NOW'}
                </span>

                {/* Watchlist Heart Button */}
                <button 
                    onClick={handleWatchlistClick} 
                    className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-xs backdrop-blur-xs transition active:scale-90 z-10"
                    title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
                >
                    <Heart size={15} className={isWatched ? "text-red-500 fill-red-500" : "text-slate-400 hover:text-red-500"} />
                </button>
            </div>

            {/* Details row */}
            <div className='flex justify-between gap-2 text-sm text-slate-800 pt-2.5 w-full'>
                <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-slate-800 group-hover:text-indigo-600 transition-colors">
                        {product.name}
                    </p>
                    <div className='flex items-center gap-0.5 mt-0.5'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={13} className='text-transparent' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                        ))}
                    </div>
                    {isAuction && product.auctionEndTime && (
                        <div className='mt-1'>
                            <CountdownTimer endTime={product.auctionEndTime} compact />
                        </div>
                    )}
                </div>
                <div className='text-right shrink-0'>
                    {isAuction ? (
                        <div>
                            <p className='font-semibold text-indigo-600'>{currency}{(product.currentBid || product.startingBid || 0).toLocaleString()}</p>
                            <p className='text-[11px] text-slate-400 font-normal'>{product.bidCount || 0} bids</p>
                        </div>
                    ) : (
                        <p className="font-semibold text-slate-800">{currency}{(product.price || 0).toLocaleString()}</p>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ProductCard