'use client'

import { addToCart } from "@/lib/features/cart/cartSlice";
import { toggleWatchlist } from "@/lib/features/watchlist/watchlistSlice";
import { StarIcon, TagIcon, TruckIcon, ShieldCheckIcon, UserIcon, GavelIcon, ShoppingCart, Zap, Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import BidInput from "./BidInput";
import { useDispatch, useSelector } from "react-redux";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { addToCartApi, toggleWatchlistApi, fetchRatings } from "@/lib/api";
import toast from "react-hot-toast";

const ProductDetails = ({ product }) => {

    const productId = product.id;
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु';
    const isAuction = product.listingType?.toLowerCase() === 'auction';

    const cart = useSelector(state => state.cart.cartItems);
    const watchlist = useSelector(state => state.watchlist.items);
    const isWatched = watchlist.includes(productId);

    const dispatch = useDispatch();
    const router = useRouter();
    const queryClient = useQueryClient();

    const [mainImage, setMainImage] = useState(product.images?.[0] || '');
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        if (product.images?.[0]) {
            setMainImage(product.images[0]);
        }
    }, [product.images]);

    const isInCart = Boolean(cart[productId]);

    const maxStock = product.stock !== undefined && product.stock !== null ? product.stock : 999;
    const isOutOfStock = !product.inStock || maxStock <= 0;

    const addToCartHandler = async () => {
        if (isInCart) {
            router.push('/cart')
            return
        }
        if (isOutOfStock) {
            toast.error('Item is currently out of stock')
            return
        }
        try {
            await addToCartApi({ listingId: productId, quantity })
            dispatch(addToCart({ productId, quantity }))
            queryClient.invalidateQueries({ queryKey: ['cart'] })
            toast.success(`Added ${quantity} item(s) to cart!`)
        } catch (err) {
            toast.error(err.message || 'Failed to add to cart')
        }
    }

    const buyNowDirectHandler = async () => {
        if (isOutOfStock) {
            toast.error('Item is currently out of stock')
            return
        }
        if (!isInCart) {
            try {
                await addToCartApi({ listingId: productId, quantity })
                dispatch(addToCart({ productId, quantity }))
                queryClient.invalidateQueries({ queryKey: ['cart'] })
            } catch (err) {
                toast.error(err.message || 'Failed to add to cart')
                return
            }
        }
        router.push('/cart')
    }

    const handleWatchlistToggle = async () => {
        dispatch(toggleWatchlist({ productId }))
        try {
            const res = await toggleWatchlistApi(productId)
            queryClient.invalidateQueries({ queryKey: ['watchlist'] })
            if (res.watched) {
                toast.success('Added to watchlist!')
            } else {
                toast('Removed from watchlist', { icon: '💔' })
            }
        } catch {
            dispatch(toggleWatchlist({ productId }))
            toast.error('Please sign in to save items to your watchlist')
        }
    }

    const { data: liveRatings = [] } = useQuery({
        queryKey: ['ratings', productId],
        queryFn: () => fetchRatings(productId),
        initialData: product.ratings || [],
    });

    const reviews = liveRatings.length > 0 ? liveRatings : (product.ratings || product.rating || []);
    const averageRating = reviews.length 
        ? reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length
        : 5;

    return (
        <div className="flex max-lg:flex-col gap-8 lg:gap-12">
            <div className="flex max-sm:flex-col-reverse gap-3 shrink-0">
                <div className="flex sm:flex-col gap-3">
                    {product.images?.map((image, index) => (
                        <div 
                            key={index} 
                            onClick={() => setMainImage(product.images[index])} 
                            className={`bg-[#F8FAFC] relative size-20 sm:size-24 rounded-xl border cursor-pointer overflow-hidden p-1 transition ${mainImage === image ? 'border-indigo-600 ring-2 ring-indigo-100' : 'border-slate-200 hover:border-slate-300'}`}
                        >
                            <Image 
                                src={image} 
                                alt="" 
                                fill 
                                sizes="96px"
                                className="object-contain p-1 group-hover:scale-105 transition" 
                            />
                        </div>
                    ))}
                </div>
                <div className="flex justify-center items-center h-80 sm:h-112 w-full sm:w-112 bg-[#F8FAFC] border border-slate-200/80 rounded-2xl relative overflow-hidden p-4">
                    <Image 
                        src={mainImage || ''} 
                        alt={product.name || ""} 
                        fill 
                        priority
                        sizes="(max-width: 640px) 100vw, 450px"
                        className="object-contain p-4 transition-all duration-300" 
                    />
                </div>
            </div>
            <div className="flex-1">
                {/* Header row: badge + watchlist button */}
                <div className="flex items-center justify-between">
                    <span className={`text-xs font-semibold px-3 py-1 rounded-full ${isAuction ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                        {isAuction ? '🔨 AUCTION' : '🛒 BUY NOW'}
                    </span>
                    <button 
                        onClick={handleWatchlistToggle} 
                        className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border transition active:scale-95 ${isWatched ? 'border-red-200 bg-red-50 text-red-600' : 'border-slate-200 text-slate-600 hover:border-slate-400'}`}
                    >
                        <Heart size={14} className={isWatched ? 'fill-red-500 text-red-500' : ''} />
                        {isWatched ? 'Watching' : 'Add to Watchlist'}
                    </button>
                </div>

                <h1 className="text-3xl font-semibold text-slate-800 mt-3">{product.name}</h1>
                <div className='flex items-center mt-2'>
                    {Array(5).fill('').map((_, index) => (
                        <StarIcon key={index} size={14} className='text-transparent mt-0.5' fill={averageRating >= index + 1 ? "#00C950" : "#D1D5DB"} />
                    ))}
                    <p className="text-sm ml-3 text-slate-500">{reviews.length} Reviews</p>
                </div>

                {isAuction ? (
                    <>
                        {/* Auction details */}
                        <div className="my-6">
                            <div className="flex items-baseline gap-3">
                                <div>
                                    <p className="text-sm text-slate-500">Current Bid</p>
                                    <p className="text-3xl font-semibold text-indigo-600">{currency}{product.currentBid?.toLocaleString()}</p>
                                </div>
                                {product.buyNowPrice && (
                                    <div className="ml-6">
                                        <p className="text-sm text-slate-500">Buy It Now Price</p>
                                        <p className="text-xl text-slate-600">{currency}{product.buyNowPrice.toLocaleString()}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 mt-2 text-sm text-slate-500">
                                <GavelIcon size={14} />
                                <p>{product.bidCount || 0} bids · Started at {currency}{product.startingBid?.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Countdown */}
                        <div className="mb-6">
                            <p className="text-sm text-slate-500 mb-2">Time Remaining</p>
                            <CountdownTimer endTime={product.auctionEndTime} />
                        </div>

                        {/* Bid placement */}
                        <BidInput product={product} />

                        {/* Buy It Now & Add to Cart on Auction */}
                        {product.buyNowPrice && (
                            <div className="mt-6 pt-6 border-t border-slate-200">
                                <p className="text-xs text-slate-400 mb-3">Don&apos;t want to wait for the auction to end?</p>
                                <div className="flex flex-wrap items-center gap-3">
                                    <button
                                        onClick={buyNowDirectHandler}
                                        className="flex items-center gap-2 bg-emerald-600 text-white px-7 py-3 text-sm font-medium rounded-lg hover:bg-emerald-700 active:scale-95 transition"
                                    >
                                        <Zap size={16} />
                                        Buy It Now — {currency}{product.buyNowPrice.toLocaleString()}
                                    </button>
                                    <button
                                        onClick={addToCartHandler}
                                        className="flex items-center gap-2 bg-slate-800 text-white px-6 py-3 text-sm font-medium rounded-lg hover:bg-slate-900 active:scale-95 transition"
                                    >
                                        <ShoppingCart size={16} />
                                        {isInCart ? 'View in Cart' : 'Add to Cart'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        {/* Standard Buy It Now / Fixed price listing */}
                        <div className="flex items-start my-6 gap-3 text-2xl font-semibold text-slate-800">
                            <p> {currency}{product.price.toLocaleString()} </p>
                            {product.mrp && <p className="text-xl text-slate-500 line-through">{currency}{product.mrp.toLocaleString()}</p>}
                        </div>
                        {product.mrp && (
                            <div className="flex items-center gap-2 text-slate-500">
                                <TagIcon size={14} />
                                <p>Save {((product.mrp - product.price) / product.mrp * 100).toFixed(0)}% right now</p>
                            </div>
                        )}

                        {/* Quantity Selector or Out of Stock Alert */}
                        {isOutOfStock ? (
                            <div className="mt-6 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium inline-block">
                                ⚠️ Currently Out of Stock
                            </div>
                        ) : (
                            <div className="flex flex-col gap-2 mt-6">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm text-slate-700 font-semibold">Quantity</p>
                                    {product.stock !== undefined && product.stock !== null && (
                                        <span className={`text-xs ${product.stock <= 3 ? 'text-amber-600 font-medium' : 'text-slate-400'}`}>
                                            ({product.stock} available)
                                        </span>
                                    )}
                                </div>
                                <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-lg border border-slate-300 w-max text-slate-700 bg-slate-50/50">
                                    <button 
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))} 
                                        disabled={quantity <= 1}
                                        className="px-2 py-0.5 text-lg font-bold select-none hover:text-indigo-600 disabled:text-slate-300 disabled:cursor-not-allowed active:scale-95"
                                    >
                                        -
                                    </button>
                                    <span className="font-semibold text-sm min-w-4 text-center">{quantity}</span>
                                    <button 
                                        onClick={() => {
                                            if (quantity >= maxStock) {
                                                toast.error(`Only ${maxStock} item(s) available in stock`)
                                                return
                                            }
                                            setQuantity(prev => prev + 1)
                                        }} 
                                        disabled={quantity >= maxStock}
                                        className="px-2 py-0.5 text-lg font-bold select-none hover:text-indigo-600 disabled:text-slate-300 disabled:cursor-not-allowed active:scale-95"
                                    >
                                        +
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Buy Now & Add to Cart on Fixed items */}
                        <div className="flex flex-wrap items-center gap-3 mt-6">
                            <button 
                                onClick={buyNowDirectHandler} 
                                disabled={isOutOfStock}
                                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 text-sm font-medium rounded-lg active:scale-95 transition"
                            >
                                <Zap size={16} />
                                {isOutOfStock ? 'Out of Stock' : 'Buy It Now'}
                            </button>
                            <button 
                                onClick={addToCartHandler} 
                                disabled={isOutOfStock}
                                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-8 py-3 text-sm font-medium rounded-lg active:scale-95 transition"
                            >
                                <ShoppingCart size={16} />
                                {isOutOfStock ? 'Unavailable' : isInCart ? 'View in Cart' : 'Add to Cart'}
                            </button>
                        </div>
                    </>
                )}

                <hr className="border-gray-300 my-6" />
                <div className="flex flex-col gap-3 text-slate-500 text-sm">
                    <p className="flex items-center gap-2.5"> <TruckIcon size={18} className="text-slate-400" /> Shipping within Nepal </p>
                    <p className="flex items-center gap-2.5"> <ShieldCheckIcon size={18} className="text-slate-400" /> Buyer Protection Guarantee </p>
                    <p className="flex items-center gap-2.5"> <UserIcon size={18} className="text-slate-400" /> Seller verified on bbay </p>
                </div>

            </div>
        </div>
    )
}

export default ProductDetails