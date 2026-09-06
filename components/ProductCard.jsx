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
        <Link href={`/product/${product.id}`} className='group max-xl:mx-auto relative'>
            <div className='relative bg-[#F5F5F5] h-40 sm:w-60 sm:h-68 rounded-lg flex items-center justify-center overflow-hidden'>
                <Image 
                    width={500} 
                    height={500} 
                    className='max-h-30 sm:max-h-40 w-auto object-contain group-hover:scale-110 transition duration-300' 
                    src={product.images?.[0] || assets.upload_area} 
                    alt={product.name || 'Product'} 
                />
                
                {/* Listing type badge */}
                <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full ${isAuction ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                    {isAuction ? 'AUCTION' : 'BUY NOW'}
                </span>

                {/* Watchlist Heart Button */}
                <button 
                    onClick={handleWatchlistClick} 
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 hover:bg-white shadow-xs backdrop-blur-xs transition active:scale-90"
                    title={isWatched ? "Remove from Watchlist" : "Add to Watchlist"}
                >
                    <Heart size={16} className={isWatched ? "text-red-500 fill-red-500" : "text-slate-400 hover:text-red-500"} />
                </button>
            </div>
            <div className='flex justify-between gap-3 text-sm text-slate-800 pt-2 max-w-60'>
                <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{product.name}</p>
                    <div className='flex'>
                        {Array(5).fill('').map((_, index) => (
                            <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={rating >= index + 1 ? "#00C950" : "#D1D5DB"} />
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
                        <>
                            <p className='font-medium'>{currency}{(product.currentBid || product.startingBid || 0).toLocaleString()}</p>
                            <p className='text-xs text-slate-400'>{product.bidCount || 0} bids</p>
                        </>
                    ) : (
                        <p className="font-medium">{currency}{(product.price || 0).toLocaleString()}</p>
                    )}
                </div>
            </div>
        </Link>
    )
}

export default ProductCard