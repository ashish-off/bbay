'use client'
import { Suspense, useEffect, useState } from "react";
import PageTitle from "@/components/PageTitle"
import OrderItem from "@/components/OrderItem";
import { orderDummyData } from "@/assets/assets";
import { useSelector } from "react-redux";
import CountdownTimer from "@/components/CountdownTimer";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

function OrdersContent() {
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु';
    const [orders, setOrders] = useState([]);
    const [activeTab, setActiveTab] = useState(tabParam === 'bids' ? 'bids' : tabParam === 'won' ? 'won' : 'orders');

    const myBids = useSelector(state => state.bid.myBids);
    const products = useSelector(state => state.product.list);

    useEffect(() => {
        setOrders(orderDummyData)
    }, []);

    useEffect(() => {
        if (tabParam === 'bids' || tabParam === 'won' || tabParam === 'orders') {
            setActiveTab(tabParam)
        }
    }, [tabParam]);

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="my-16 max-w-7xl mx-auto">
                <PageTitle heading="My Activity" text="Manage your orders, won auctions & active bids" linkText={'Browse listings'} />

                {/* Tab selector */}
                <div className="flex gap-4 border-b border-slate-200 mt-6 mb-8 text-sm overflow-x-auto">
                    <button 
                        onClick={() => setActiveTab('orders')}
                        className={`pb-3 font-medium whitespace-nowrap transition cursor-pointer ${activeTab === 'orders' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                        Direct Orders ({orders.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('bids')}
                        className={`pb-3 font-medium whitespace-nowrap transition cursor-pointer ${activeTab === 'bids' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                        Active Bids ({myBids.length})
                    </button>
                    <button 
                        onClick={() => setActiveTab('won')}
                        className={`pb-3 font-medium whitespace-nowrap transition cursor-pointer ${activeTab === 'won' ? 'border-b-2 border-indigo-600 text-indigo-600' : 'text-slate-400 hover:text-slate-700'}`}
                    >
                        Won Auctions (0)
                    </button>
                </div>

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                    orders.length > 0 ? (
                        <table className="w-full max-w-5xl text-slate-500 table-auto border-separate border-spacing-y-12 border-spacing-x-4">
                            <thead>
                                <tr className="max-sm:text-sm text-slate-600 max-md:hidden">
                                    <th className="text-left">Product</th>
                                    <th className="text-center">Total Price</th>
                                    <th className="text-left">Address</th>
                                    <th className="text-left">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders.map((order) => (
                                    <OrderItem order={order} key={order.id} />
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <div className="py-20 text-center text-slate-400">
                            You have no orders yet.
                        </div>
                    )
                )}

                {/* Active Bids Tab */}
                {activeTab === 'bids' && (
                    myBids.length > 0 ? (
                        <div className="grid gap-4 max-w-4xl">
                            {myBids.map((bid) => {
                                const prod = products.find(p => p.id === bid.productId)
                                return (
                                    <div key={bid.id} className="border border-slate-200 p-4 rounded-xl flex items-center justify-between">
                                        <div>
                                            <Link href={`/product/${bid.productId}`} className="font-semibold text-slate-800 hover:text-indigo-600">
                                                {prod?.name || 'Auction Item'}
                                            </Link>
                                            <p className="text-xs text-slate-400 mt-1">Bid placed: {new Date(bid.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm font-semibold text-indigo-600">{currency}{bid.amount.toLocaleString()}</p>
                                            {prod?.auctionEndTime && (
                                                <div className="mt-1">
                                                    <CountdownTimer endTime={prod.auctionEndTime} compact />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="py-20 text-center text-slate-400">
                            No active bids yet. Explore live auctions!
                        </div>
                    )
                )}

                {/* Won Auctions Tab */}
                {activeTab === 'won' && (
                    <div className="py-20 text-center text-slate-400">
                        No won auctions yet. Keep bidding!
                    </div>
                )}
            </div>
        </div>
    )
}

export default function Orders() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading activity...</div>}>
            <OrdersContent />
        </Suspense>
    )
}