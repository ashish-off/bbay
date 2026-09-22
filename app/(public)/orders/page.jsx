'use client'
import { Suspense, useState, useEffect } from "react";
import PageTitle from "@/components/PageTitle"
import OrderItem from "@/components/OrderItem";
import CountdownTimer from "@/components/CountdownTimer";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchUserOrders, fetchWonAuctions, clientCache } from "@/lib/api";
import { useUser, useClerk } from "@clerk/nextjs";
import { Package, Gavel, Award, CheckCircle2, Clock, ArrowRight, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";

function OrdersContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु';
    const { user, isLoaded } = useUser();
    const { openSignIn } = useClerk();

    const [activeTab, setActiveTab] = useState(
        tabParam === 'bids' ? 'bids' : tabParam === 'won' ? 'won' : 'orders'
    );

    // Show toast for eSewa payment result
    const paymentStatus = searchParams.get('payment');
    useEffect(() => {
        if (paymentStatus === 'success') {
            toast.success('Payment successful! Your order has been placed.');
        } else if (paymentStatus === 'failed') {
            toast.error('Payment failed or cancelled. Please try again.');
        } else if (paymentStatus === 'cancelled') {
            toast('Payment was cancelled. Your cart items are preserved.', { icon: 'ℹ️' });
        }
    }, [paymentStatus]);

    const { data: orders = [], isLoading: isLoadingOrders } = useQuery({
        queryKey: ['orders'],
        queryFn: fetchUserOrders,
        enabled: Boolean(user),
    });

    const { data: wonAuctions = [], isLoading: isLoadingWon } = useQuery({
        queryKey: ['won-auctions'],
        queryFn: fetchWonAuctions,
        enabled: Boolean(user),
    });

    if (isLoaded && !user) {
        return (
            <div className="min-h-[70vh] mx-6 flex flex-col items-center justify-center text-center">
                <div className="size-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                    <Package size={28} />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Please sign in to view your activity</h2>
                <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
                    Sign in to track placed orders, shipping statuses, and live auction bids.
                </p>
                <button 
                    onClick={openSignIn} 
                    className="bg-indigo-600 text-white text-sm px-6 py-2.5 rounded-full hover:bg-indigo-700 transition font-medium cursor-pointer"
                >
                    Sign In
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="my-16 max-w-7xl mx-auto">
                <PageTitle heading="My Activity" text="Manage your orders, won auctions & active bids" linkText={'Browse listings'} />

                {/* Tab selector */}
                <div className="flex gap-6 border-b border-slate-200 mt-6 mb-8 text-sm overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('orders')}
                        className={`pb-3 font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'orders' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                        <Package size={16} /> Direct Orders ({orders.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('won')}
                        className={`pb-3 font-semibold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${activeTab === 'won' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                        <Award size={16} /> Won Auctions ({wonAuctions.length})
                    </button>
                </div>

                {activeTab === 'orders' && (
                    isLoadingOrders && orders.length === 0 ? (
                        <div className="py-20 text-center text-slate-400">
                            <div className="inline-block size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-sm">Loading your orders...</p>
                        </div>
                    ) : orders.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-8 border-spacing-x-4">
                                <thead>
                                    <tr className="max-sm:text-sm text-slate-400 uppercase text-xs tracking-wider max-md:hidden">
                                        <th className="text-left font-semibold">Product</th>
                                        <th className="text-center font-semibold">Total Price</th>
                                        <th className="text-center font-semibold">Payment</th>
                                        <th className="text-left font-semibold">Delivery Address</th>
                                        <th className="text-left font-semibold">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {orders.map((order) => (
                                        <OrderItem order={order} key={order.id} />
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="py-24 text-center">
                            <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                                <Package size={28} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700">No orders yet</h3>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-6">
                                Once you purchase items from the store, your delivery details will appear here.
                            </p>
                            <Link href="/shop" className="bg-indigo-600 text-white text-xs px-5 py-2.5 rounded-full hover:bg-indigo-700 transition font-medium">
                                Shop Now
                            </Link>
                        </div>
                    )
                )}

                {activeTab === 'won' && (
                    isLoadingWon ? (
                        <div className="py-20 text-center text-slate-400">
                            <div className="inline-block size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2"></div>
                            <p className="text-sm">Loading won auctions...</p>
                        </div>
                    ) : wonAuctions.length > 0 ? (
                        <div className="space-y-4 max-w-5xl">
                            {wonAuctions.map((item) => {
                                const winningPrice = item.currentBid || item.startingBid || 0;
                                const isPaid = item.isPaid;
                                const hasOrder = item.hasOrder;

                                return (
                                    <div 
                                        key={item.id}
                                        className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 transition hover:border-slate-300"
                                    >
                                        <div className="flex items-center gap-4 min-w-0">
                                            <div className="relative size-20 rounded-xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                                <Image
                                                    src={item.images?.[0] || '/placeholder.png'}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                                                        Won Auction
                                                    </span>
                                                    {isPaid ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                                            <CheckCircle2 size={12} /> Paid
                                                        </span>
                                                    ) : hasOrder ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">
                                                            <Clock size={12} /> Placed (COD)
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                                                            <Clock size={12} /> Awaiting Payment
                                                        </span>
                                                    )}
                                                </div>
                                                <Link 
                                                    href={`/product/${item.id}`} 
                                                    className="font-bold text-slate-800 hover:text-indigo-600 transition block truncate mt-1 text-base"
                                                >
                                                    {item.name}
                                                </Link>
                                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                                                    <span>Winning Bid: <strong className="text-slate-700 font-semibold">{currency}{winningPrice.toLocaleString()}</strong></span>
                                                    {item.seller?.name && (
                                                        <span>• Seller: <span className="text-slate-600">{item.seller.name}</span></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                                            {!hasOrder || (!isPaid && item.order?.paymentMethod === 'ESEWA') ? (
                                                <Link
                                                    href={`/auction/checkout/${item.id}`}
                                                    className="bg-indigo-600 text-white text-xs font-semibold px-5 py-2.5 rounded-full hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-xs"
                                                >
                                                    Pay Now <ArrowRight size={13} />
                                                </Link>
                                            ) : (
                                                <div className="text-right">
                                                    <span className="text-xs text-slate-500 font-medium block">
                                                        Order #{item.order?.id?.slice(0, 8)}...
                                                    </span>
                                                    <span className="text-[11px] text-emerald-600 font-semibold">
                                                        {item.order?.status || 'Processing'}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="py-24 text-center">
                            <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto mb-3">
                                <Award size={28} />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-700">No won auctions yet</h3>
                            <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1 mb-6">
                                Participate in live bidding! High bidders when countdown ends will have their won items listed here.
                            </p>
                            <Link href="/shop?type=AUCTION" className="bg-indigo-600 text-white text-xs px-5 py-2.5 rounded-full hover:bg-indigo-700 transition font-medium">
                                Explore Live Auctions
                            </Link>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}

export default function Orders() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading activity...</div>}>
            <OrdersContent />
        </Suspense>
    );
}