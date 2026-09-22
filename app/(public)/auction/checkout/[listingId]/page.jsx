'use client'
import React, { useState, useEffect, use } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useUser, useClerk } from '@clerk/nextjs'
import toast from 'react-hot-toast'
import { 
    Award, 
    CheckCircle2, 
    PlusIcon, 
    SquarePenIcon, 
    XIcon, 
    ShieldCheck, 
    Truck, 
    ArrowLeft, 
    ShoppingBag,
    AlertCircle
} from 'lucide-react'
import PageTitle from '@/components/PageTitle'
import AddressModal from '@/components/AddressModal'
import { 
    fetchAddresses, 
    validateCouponApi, 
    fetchWonAuctions, 
    createAuctionOrder, 
    initiateAuctionEsewaPayment 
} from '@/lib/api'
import { DELIVERY_FEE, COD_FEE, calculateOrderBilling } from '@/lib/pricing'

export default function AuctionCheckoutPage() {
    const params = useParams()
    const listingId = params?.listingId
    const router = useRouter()
    const { user, isLoaded } = useUser()
    const { openSignIn } = useClerk()
    const queryClient = useQueryClient()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'

    const [paymentMethod, setPaymentMethod] = useState('COD')
    const [selectedAddressId, setSelectedAddressId] = useState('')
    const [showAddressModal, setShowAddressModal] = useState(false)
    const [couponCodeInput, setCouponCodeInput] = useState('')
    const [coupon, setCoupon] = useState(null)
    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false)
    const [isEsewaProcessing, setIsEsewaProcessing] = useState(false)

    // Fetch won auctions to find this listing
    const { data: wonAuctions = [], isLoading: isLoadingWon } = useQuery({
        queryKey: ['won-auctions'],
        queryFn: fetchWonAuctions,
        enabled: Boolean(user),
    })

    // Fetch user addresses
    const { data: addresses = [], isLoading: isLoadingAddresses } = useQuery({
        queryKey: ['addresses'],
        queryFn: fetchAddresses,
        enabled: Boolean(user),
    })

    const listing = wonAuctions.find(item => item.id === listingId)

    // Auto-select first address if none explicitly chosen
    const activeAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0] || null

    const codOrderMutation = useMutation({
        mutationFn: createAuctionOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] })
            queryClient.invalidateQueries({ queryKey: ['won-auctions'] })
            queryClient.invalidateQueries({ queryKey: ['listings'] })
            toast.success('Order placed successfully via Cash on Delivery!')
            router.push('/orders?tab=won')
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to place order')
        },
    })

    const handleCouponCode = async (e) => {
        e.preventDefault()
        const code = couponCodeInput.trim().toUpperCase()
        if (!code) return

        setIsCheckingCoupon(true)
        try {
            const res = await validateCouponApi(code)
            setCoupon(res)
            toast.success(`Coupon ${res.code} applied! (${res.discount}% off)`)
            setCouponCodeInput('')
        } catch (err) {
            toast.error(err.message || 'Invalid or expired coupon')
        } finally {
            setIsCheckingCoupon(false)
        }
    }

    const handleConfirmOrder = async (e) => {
        e.preventDefault()

        if (!user) {
            toast.error('Please sign in to complete your checkout')
            openSignIn()
            return
        }

        if (!activeAddress) {
            toast.error('Please select or add a delivery address first')
            setShowAddressModal(true)
            return
        }

        if (paymentMethod === 'ESEWA') {
            setIsEsewaProcessing(true)
            try {
                const res = await initiateAuctionEsewaPayment({
                    listingId,
                    addressId: activeAddress.id,
                    couponCode: coupon?.code || null,
                })

                // Create hidden form and submit to eSewa payment gateway
                const form = document.createElement('form')
                form.method = 'POST'
                form.action = res.paymentUrl
                Object.entries(res.formData).forEach(([key, value]) => {
                    const input = document.createElement('input')
                    input.type = 'hidden'
                    input.name = key
                    input.value = value
                    form.appendChild(input)
                })
                document.body.appendChild(form)
                form.submit()
            } catch (err) {
                toast.error(err.message || 'Failed to initiate eSewa payment')
                setIsEsewaProcessing(false)
            }
        } else {
            // COD
            codOrderMutation.mutate({
                listingId,
                addressId: activeAddress.id,
                paymentMethod: 'COD',
                couponCode: coupon?.code || null,
            })
        }
    }

    if (isLoaded && !user) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-center px-4">
                <div className="size-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                    <Award size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Sign in to complete your auction checkout</h2>
                <p className="text-sm text-slate-500 max-w-sm mt-1 mb-6">
                    Sign in with the winning account to proceed with address verification and payment.
                </p>
                <button
                    onClick={openSignIn}
                    className="bg-indigo-600 text-white text-sm px-6 py-2.5 rounded-full hover:bg-indigo-700 transition font-medium cursor-pointer"
                >
                    Sign In
                </button>
            </div>
        )
    }

    if (isLoadingWon) {
        return (
            <div className="min-h-[70vh] flex flex-col items-center justify-center text-slate-400">
                <div className="inline-block size-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-sm">Loading your auction details...</p>
            </div>
        )
    }

    if (!listing) {
        return (
            <div className="min-h-[70vh] max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="size-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Auction Win Not Found</h2>
                <p className="text-sm text-slate-500 mt-2 mb-6">
                    We could not find an active winning record for this listing under your account. Either you did not win this auction, or the auction hasn&apos;t ended yet.
                </p>
                <div className="flex gap-4 justify-center">
                    <Link
                        href="/orders?tab=won"
                        className="bg-indigo-600 text-white text-sm px-5 py-2.5 rounded-full hover:bg-indigo-700 transition font-medium"
                    >
                        View My Won Auctions
                    </Link>
                    <Link
                        href="/shop"
                        className="border border-slate-300 text-slate-700 text-sm px-5 py-2.5 rounded-full hover:bg-slate-50 transition font-medium"
                    >
                        Back to Shop
                    </Link>
                </div>
            </div>
        )
    }

    if (listing.isPaid) {
        return (
            <div className="min-h-[70vh] max-w-2xl mx-auto px-4 py-16 text-center">
                <div className="size-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 size={32} />
                </div>
                <h2 className="text-xl font-bold text-slate-800">Auction Already Paid!</h2>
                <p className="text-sm text-slate-500 mt-2 mb-6">
                    You have already completed payment and placed the order for &quot;{listing.name}&quot;.
                </p>
                <Link
                    href="/orders"
                    className="bg-indigo-600 text-white text-sm px-6 py-2.5 rounded-full hover:bg-indigo-700 transition font-medium"
                >
                    View My Orders
                </Link>
            </div>
        )
    }

    const winningPrice = listing.currentBid || listing.startingBid || 0
    const billing = calculateOrderBilling({
        subtotal: winningPrice,
        discountPercent: coupon?.discount || 0,
        paymentMethod,
    })
    const { discountAmount, deliveryFee, paymentFee, finalTotal } = billing

    return (
        <div className="min-h-[75vh] max-w-5xl mx-auto px-4 sm:px-6 py-10">
            {/* Back button */}
            <Link
                href="/orders?tab=won"
                className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition font-medium mb-6"
            >
                <ArrowLeft size={14} /> Back to Won Auctions
            </Link>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6 mb-8">
                <div>
                    <div className="inline-flex items-center gap-1.5 bg-amber-50 border border-amber-200/80 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full mb-2">
                        <Award size={13} /> Won Auction Checkout
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Claim Your Winning Bid</h1>
                    <p className="text-sm text-slate-500 mt-0.5">
                        Complete your delivery and payment details to receive your item.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                {/* Left Column: Won Item Card & Address */}
                <div className="lg:col-span-7 space-y-6">
                    {/* Won Item Card */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <h2 className="text-base font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <ShoppingBag size={18} className="text-indigo-600" /> Won Item
                        </h2>
                        <div className="flex gap-4">
                            <div className="relative size-24 shrink-0 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                                <Image
                                    src={listing.images?.[0] || '/placeholder.png'}
                                    alt={listing.name}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                            <div className="flex-1 min-w-0">
                                <span className="text-[11px] font-semibold text-indigo-600 uppercase tracking-wider">
                                    {listing.category}
                                </span>
                                <h3 className="text-base font-bold text-slate-800 truncate mt-0.5">
                                    {listing.name}
                                </h3>
                                <div className="flex items-center gap-2 mt-2">
                                    <span className="text-xs text-slate-400">Winning Bid:</span>
                                    <span className="text-base font-black text-slate-900">
                                        {currency}{winningPrice.toLocaleString()}
                                    </span>
                                </div>
                                {listing.seller?.name && (
                                    <p className="text-xs text-slate-400 mt-1">
                                        Seller: <span className="text-slate-600 font-medium">{listing.seller.name}</span>
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Delivery Address Section */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
                                <Truck size={18} className="text-indigo-600" /> Delivery Address
                            </h2>
                            {addresses.length > 0 && (
                                <button
                                    type="button"
                                    onClick={() => setShowAddressModal(true)}
                                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
                                >
                                    <SquarePenIcon size={13} /> Change / Add
                                </button>
                            )}
                        </div>

                        {addresses.length === 0 ? (
                            <div className="text-center py-6 border-2 border-dashed border-slate-200 rounded-xl">
                                <p className="text-xs text-slate-500 mb-3">No delivery address found</p>
                                <button
                                    type="button"
                                    onClick={() => setShowAddressModal(true)}
                                    className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                                >
                                    <PlusIcon size={14} /> Add Delivery Address
                                </button>
                            </div>
                        ) : activeAddress ? (
                            <div className="p-4 rounded-xl border border-indigo-200 bg-indigo-50/30">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">
                                            {activeAddress.fullName || user.fullName}
                                        </p>
                                        <p className="text-xs text-slate-600 mt-1">
                                            {activeAddress.street}, {activeAddress.city}, {activeAddress.state} {activeAddress.zipCode}
                                        </p>
                                        <p className="text-xs text-slate-500 mt-0.5">
                                            Phone: {activeAddress.phone}
                                        </p>
                                    </div>
                                    <CheckCircle2 size={18} className="text-indigo-600 shrink-0" />
                                </div>
                            </div>
                        ) : null}
                    </div>

                    {/* Trust guarantee badge */}
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                        <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
                        <span>
                            Your winning price of <strong>{currency}{winningPrice.toLocaleString()}</strong> is locked and verified. 100% Buyer Protection guaranteed.
                        </span>
                    </div>
                </div>

                {/* Right Column: Payment & Order Summary */}
                <div className="lg:col-span-5">
                    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                        <h2 className="text-base font-bold text-slate-800 mb-4">Payment Method</h2>

                        {/* Payment Method Radio Options */}
                        <div className="space-y-2.5 mb-6">
                            <label
                                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                                    paymentMethod === 'COD'
                                        ? 'border-indigo-600 bg-indigo-50/50 text-slate-900 font-medium shadow-xs ring-1 ring-indigo-500/20'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="auction-payment"
                                        value="COD"
                                        checked={paymentMethod === 'COD'}
                                        onChange={() => setPaymentMethod('COD')}
                                        className="accent-indigo-600 size-4 cursor-pointer"
                                    />
                                    <div className="text-xs">
                                        <span className="font-semibold block text-slate-800">Cash on Delivery</span>
                                        <span className="text-[11px] text-slate-400">Pay when package arrives</span>
                                    </div>
                                </div>
                                <span className="text-[11px] font-semibold text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded-md">
                                    +{currency}{COD_FEE} Fee
                                </span>
                            </label>

                            <label
                                className={`flex items-center justify-between p-3.5 rounded-xl border cursor-pointer transition ${
                                    paymentMethod === 'ESEWA'
                                        ? 'border-green-600 bg-green-50/50 text-slate-900 font-medium shadow-xs ring-1 ring-green-500/20'
                                        : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="auction-payment"
                                        value="ESEWA"
                                        checked={paymentMethod === 'ESEWA'}
                                        onChange={() => setPaymentMethod('ESEWA')}
                                        className="accent-green-600 size-4 cursor-pointer"
                                    />
                                    <div className="text-xs">
                                        <span className="font-semibold block text-slate-800">eSewa (Pay Now)</span>
                                        <span className="text-[11px] text-slate-400">Instant digital wallet payment</span>
                                    </div>
                                </div>
                                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                                    {currency}0 Fee (Free)
                                </span>
                            </label>
                        </div>

                        {/* Coupon Code Input */}
                        <div className="mb-6 pt-4 border-t border-slate-100">
                            <p className="text-xs font-semibold text-slate-700 mb-2">Have a coupon code?</p>
                            {coupon ? (
                                <div className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
                                    <span className="font-semibold">
                                        {coupon.code} ({coupon.discount}% OFF)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => setCoupon(null)}
                                        className="text-emerald-700 hover:text-emerald-900 cursor-pointer"
                                    >
                                        <XIcon size={14} />
                                    </button>
                                </div>
                            ) : (
                                <form onSubmit={handleCouponCode} className="flex gap-2">
                                    <input
                                        type="text"
                                        placeholder="Enter coupon code"
                                        value={couponCodeInput}
                                        onChange={(e) => setCouponCodeInput(e.target.value)}
                                        className="flex-1 uppercase text-xs border border-slate-200 rounded-lg px-3 py-2 outline-none focus:border-indigo-600 transition"
                                    />
                                    <button
                                        type="submit"
                                        disabled={isCheckingCoupon || !couponCodeInput.trim()}
                                        className="bg-slate-800 hover:bg-slate-900 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition cursor-pointer"
                                    >
                                        {isCheckingCoupon ? 'Applying...' : 'Apply'}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Price Breakdown */}
                        <div className="pt-4 border-t border-slate-100 space-y-2.5 text-xs">
                            <div className="flex justify-between text-slate-600">
                                <span>Winning Bid Amount</span>
                                <span className="font-semibold text-slate-800">
                                    {currency}{winningPrice.toLocaleString()}
                                </span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Delivery Fee</span>
                                <span className="font-semibold text-slate-800">{currency}{deliveryFee.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>
                                    Payment Fee {paymentMethod === 'COD' ? '(COD Handling)' : '(Pay Now)'}
                                </span>
                                {paymentMethod === 'COD' ? (
                                    <span className="font-semibold text-amber-700">+{currency}{paymentFee.toLocaleString()}</span>
                                ) : (
                                    <span className="font-semibold text-emerald-600">{currency}0 (Free)</span>
                                )}
                            </div>
                            {coupon && (
                                <div className="flex justify-between text-emerald-600 font-medium">
                                    <span>Coupon Discount ({coupon.discount}%)</span>
                                    <span>-{currency}{discountAmount.toLocaleString()}</span>
                                </div>
                            )}

                            <div className="flex justify-between text-sm font-bold text-slate-900 pt-3 border-t border-slate-200">
                                <div>
                                    <span>Total Amount</span>
                                    <p className="text-[11px] font-normal text-slate-400">
                                        Incl. {currency}{deliveryFee} delivery{paymentMethod === 'COD' ? ` + ${currency}${paymentFee} COD` : ''}
                                    </p>
                                </div>
                                <span className="text-base text-indigo-600">
                                    {currency}{finalTotal.toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Submit button */}
                        <button
                            type="button"
                            onClick={handleConfirmOrder}
                            disabled={codOrderMutation.isPending || isEsewaProcessing || !activeAddress}
                            className={`w-full mt-6 py-3 px-4 rounded-xl font-bold text-sm text-white transition flex items-center justify-center gap-2 cursor-pointer ${
                                paymentMethod === 'ESEWA'
                                    ? 'bg-[#60bb46] hover:bg-[#52a43b]'
                                    : 'bg-indigo-600 hover:bg-indigo-700'
                            } disabled:opacity-50 disabled:cursor-not-allowed shadow-sm`}
                        >
                            {codOrderMutation.isPending || isEsewaProcessing ? (
                                <>
                                    <div className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    <span>Processing Payment...</span>
                                </>
                            ) : paymentMethod === 'ESEWA' ? (
                                <>Pay {currency}{finalTotal.toLocaleString()} with eSewa</>
                            ) : (
                                <>Confirm Cash on Delivery ({currency}{finalTotal.toLocaleString()})</>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Address Modal */}
            {showAddressModal && (
                <AddressModal
                    setShowAddressModal={setShowAddressModal}
                    onAddressAdded={(newAddr) => {
                        if (newAddr?.id) setSelectedAddressId(newAddr.id)
                        queryClient.invalidateQueries({ queryKey: ['addresses'] })
                    }}
                />
            )}
        </div>
    )
}
