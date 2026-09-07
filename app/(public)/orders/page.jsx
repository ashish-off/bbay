'use client'
import { Suspense, useState } from "react";
import PageTitle from "@/components/PageTitle"
import OrderItem from "@/components/OrderItem";
import CountdownTimer from "@/components/CountdownTimer";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchUserOrders, clientCache } from "@/lib/api";
import { useUser, useClerk } from "@clerk/nextjs";
import { Package, Gavel, Award } from "lucide-react";

function OrdersContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु';
    const { user, isLoaded } = useUser();
    const { openSignIn } = useClerk();

    const [activeTab, setActiveTab] = useState(
        tabParam === 'bids' ? 'bids' : tabParam === 'won' ? 'won' : 'orders'
    );

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['orders'],
        queryFn: fetchUserOrders,
        enabled: Boolean(user),
        initialData: () => clientCache.get('user_orders') || undefined,
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
                        <Award size={16} /> Won Auctions (0)
                    </button>
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    isLoading && orders.length === 0 ? (
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

                {/* Won Auctions Tab */}
                {activeTab === 'won' && (
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