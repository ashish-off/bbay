'use client'
import { Star, MessageSquarePlus, CheckCircle2, AlertCircle } from "lucide-react"
import Image from "next/image"
import { useState } from "react"
import BidHistory from "./BidHistory"
import { assets } from "@/assets/assets"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchRatings, createRatingApi, fetchListingBids } from "@/lib/api"
import { useUser, useClerk } from "@clerk/nextjs"
import toast from "react-hot-toast"

const ProductDescription = ({ product }) => {
    const isAuction = product.listingType?.toLowerCase() === 'auction'
    const tabs = isAuction ? ['Description', 'Reviews', 'Bid History'] : ['Description', 'Reviews']
    const [selectedTab, setSelectedTab] = useState('Description')

    const { user } = useUser()
    const { openSignIn } = useClerk()
    const queryClient = useQueryClient()

    // Form state
    const [showReviewForm, setShowReviewForm] = useState(false)
    const [rating, setRating] = useState(5)
    const [hoverRating, setHoverRating] = useState(0)
    const [reviewText, setReviewText] = useState('')

    // Fetch live ratings from API
    const { data: liveReviews = [], isLoading } = useQuery({
        queryKey: ['ratings', product.id],
        queryFn: () => fetchRatings(product.id),
        initialData: product.ratings || [],
    })

    // Fetch live bids for auction
    const { data: liveBids = [] } = useQuery({
        queryKey: ['bids', product.id],
        queryFn: () => fetchListingBids(product.id),
        enabled: Boolean(isAuction && product.id),
        initialData: product.bids || [],
    })

    const bidsCount = liveBids.length || product.bidCount || product._count?.bids || 0

    const isSeller = user?.id === product.sellerId

    const mutation = useMutation({
        mutationFn: createRatingApi,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['ratings', product.id] })
            queryClient.invalidateQueries({ queryKey: ['listing', product.id] })
            queryClient.invalidateQueries({ queryKey: ['listings'] })
            toast.success(data.isUpdated ? 'Review updated!' : 'Review submitted successfully!')
            setShowReviewForm(false)
            setReviewText('')
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to submit review')
        },
    })

    const handleSubmitReview = (e) => {
        e.preventDefault()

        if (!user) {
            toast.error('Please sign in to write a review')
            openSignIn()
            return
        }

        if (isSeller) {
            toast.error('You cannot review your own listing')
            return
        }

        if (!reviewText.trim()) {
            toast.error('Please enter your review comments')
            return
        }

        mutation.mutate({
            listingId: product.id,
            rating,
            review: reviewText.trim(),
        })
    }

    const avgRating = liveReviews.length > 0
        ? (liveReviews.reduce((sum, r) => sum + r.rating, 0) / liveReviews.length).toFixed(1)
        : null

    return (
        <div className="my-18 text-sm text-slate-600">
            {/* Tabs */}
            <div className="flex border-b border-slate-200 mb-6 max-w-2xl">
                {tabs.map((tab, index) => (
                    <button 
                        key={index} 
                        onClick={() => setSelectedTab(tab)}
                        className={`${tab === selectedTab ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold' : 'text-slate-400 hover:text-slate-700'} px-4 py-2.5 font-medium transition cursor-pointer`}
                    >
                        {tab} {tab === 'Reviews' && `(${liveReviews.length})`} {tab === 'Bid History' && `(${bidsCount})`}
                    </button>
                ))}
            </div>

            {/* Description */}
            {selectedTab === "Description" && (
                <div className="max-w-xl leading-relaxed whitespace-pre-line text-slate-700">
                    {product.description}
                </div>
            )}

            {/* Reviews */}
            {selectedTab === "Reviews" && (
                <div className="max-w-2xl">
                    {/* Rating Overview Header */}
                    <div className="flex flex-wrap items-center justify-between gap-4 p-5 bg-slate-50 border border-slate-200/80 rounded-2xl mb-8">
                        <div>
                            <div className="flex items-center gap-3">
                                {avgRating ? (
                                    <>
                                        <span className="text-3xl font-bold text-slate-800">{avgRating}</span>
                                        <div className="flex text-amber-400">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star 
                                                    key={star} 
                                                    size={18} 
                                                    className={parseFloat(avgRating) >= star ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
                                                />
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-sm font-semibold text-slate-700">No ratings yet</span>
                                )}
                            </div>
                            <p className="text-xs text-slate-400 mt-1">Based on {liveReviews.length} customer review(s)</p>
                        </div>

                        {!isSeller && (
                            <button
                                onClick={() => {
                                    if (!user) {
                                        toast.error('Please sign in to leave a review')
                                        openSignIn()
                                        return
                                    }
                                    setShowReviewForm(prev => !prev)
                                }}
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer"
                            >
                                <MessageSquarePlus size={15} />
                                {showReviewForm ? 'Cancel Review' : 'Write a Review'}
                            </button>
                        )}
                    </div>

                    {/* Write Review Form */}
                    {showReviewForm && (
                        <form onSubmit={handleSubmitReview} className="p-6 bg-white border border-indigo-200 rounded-2xl shadow-xs mb-8 animate-in fade-in zoom-in-95 duration-200">
                            <h3 className="font-bold text-slate-800 text-base mb-1">Your Review</h3>
                            <p className="text-xs text-slate-400 mb-4">Share your honest feedback about this product</p>

                            {/* Star Selection */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Rating</label>
                                <div className="flex items-center gap-1.5">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            type="button"
                                            key={star}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="p-1 cursor-pointer transition-transform hover:scale-110"
                                        >
                                            <Star 
                                                size={24} 
                                                className={(hoverRating || rating) >= star ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
                                            />
                                        </button>
                                    ))}
                                    <span className="text-xs font-bold text-slate-700 ml-2">
                                        {rating} of 5 Stars
                                    </span>
                                </div>
                            </div>

                            {/* Review Text */}
                            <div className="mb-4">
                                <label className="text-xs font-semibold text-slate-700 block mb-1.5">Review Details</label>
                                <textarea
                                    value={reviewText}
                                    onChange={(e) => setReviewText(e.target.value)}
                                    placeholder="How was the product quality, accuracy to description, or delivery?"
                                    rows={4}
                                    required
                                    className="w-full p-3 border border-slate-200 rounded-xl outline-none focus:border-indigo-500 text-sm resize-none"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowReviewForm(false)}
                                    className="px-4 py-2 text-xs font-medium text-slate-500 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={mutation.isPending}
                                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-xs font-semibold rounded-lg shadow-xs transition cursor-pointer flex items-center gap-1.5"
                                >
                                    {mutation.isPending ? (
                                        <>
                                            <span className="size-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                            Submitting...
                                        </>
                                    ) : (
                                        "Submit Review"
                                    )}
                                </button>
                            </div>
                        </form>
                    )}

                    {/* Reviews List */}
                    <div className="space-y-6">
                        {liveReviews.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50/60 rounded-2xl border border-slate-100">
                                <p className="text-slate-500 font-medium">No reviews yet</p>
                                <p className="text-xs text-slate-400 mt-1">Be the first to review this listing!</p>
                            </div>
                        ) : (
                            liveReviews.map((item, index) => (
                                <div key={item.id || index} className="border-b border-slate-100 pb-6 last:border-0">
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className="relative size-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200">
                                                <Image 
                                                    src={item.user?.image || assets.gs_logo} 
                                                    alt={item.user?.name || 'Reviewer'} 
                                                    fill
                                                    sizes="40px"
                                                    className="object-cover" 
                                                />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-1.5">
                                                    <p className="font-semibold text-slate-800 text-sm">{item.user?.name || 'bbay user'}</p>
                                                    <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 font-medium bg-emerald-50 px-1.5 py-0.5 rounded">
                                                        <CheckCircle2 size={10} /> Verified
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-slate-400">
                                                    {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex text-amber-400">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star 
                                                    key={star} 
                                                    size={14} 
                                                    className={item.rating >= star ? "fill-amber-400 text-amber-400" : "text-slate-200"} 
                                                />
                                            ))}
                                        </div>
                                    </div>

                                    <p className="text-sm text-slate-600 leading-relaxed pl-13">
                                        {item.review}
                                    </p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Bid History */}
            {selectedTab === "Bid History" && isAuction && (
                <BidHistory productId={product.id} />
            )}

            {/* Seller Info */}
            {product.seller && (
                <div className="flex items-center gap-3 mt-14 pt-6 border-t border-slate-200">
                    <div className="relative size-11 rounded-full overflow-hidden ring-1 ring-slate-200 shrink-0">
                        <Image 
                            src={product.seller.image || assets.gs_logo} 
                            alt={product.seller.name || 'Seller'} 
                            fill
                            sizes="44px"
                            className="object-cover" 
                        />
                    </div>
                    <div>
                        <p className="font-semibold text-slate-700">Listed by {product.seller.name || 'Seller'}</p>
                        <p className="text-xs text-slate-400">Verified Seller on bbay</p>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ProductDescription