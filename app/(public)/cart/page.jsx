'use client'
import Counter from "@/components/Counter";
import OrderSummary from "@/components/OrderSummary";
import PageTitle from "@/components/PageTitle";
import { Trash2Icon, InfoIcon, ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchCart, removeFromCartApi, updateCartQtyApi, clientCache } from "@/lib/api";
import { useUser, useClerk } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";
import { useEffect, Suspense } from "react";
import toast from "react-hot-toast";

function CartContent() {
    const searchParams = useSearchParams();
    const paymentStatus = searchParams?.get('payment');

    useEffect(() => {
        if (paymentStatus === 'cancelled') {
            toast('Payment cancelled. Your cart items are preserved.', { icon: 'ℹ️' });
        } else if (paymentStatus === 'failed') {
            toast.error('Payment failed. Please try again.');
        }
    }, [paymentStatus]);

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु';
    const { user, isLoaded } = useUser();
    const { openSignIn } = useClerk();
    const queryClient = useQueryClient();

    const { data: cartData, isLoading } = useQuery({
        queryKey: ['cart'],
        queryFn: fetchCart,
        enabled: Boolean(user),
        initialData: () => {
            const cached = clientCache.get('cart_items');
            return cached ? { cart: {}, items: cached } : undefined;
        },
    });

    const removeMutation = useMutation({
        mutationFn: removeFromCartApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.success('Item removed from cart');
        },
        onError: () => {
            toast.error('Failed to remove item');
        },
    });

    const updateQtyMutation = useMutation({
        mutationFn: updateCartQtyApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (err) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.error(err.message || 'Failed to update quantity');
        },
    });

    const items = cartData?.items || [];
    const totalPrice = items.reduce((acc, item) => {
        const price = item.buyNowPrice || item.price || 0;
        return acc + price * (item.quantity || 1);
    }, 0);

    const handleRemove = (listingId) => {
        removeMutation.mutate(listingId);
    };

    const handleQtyChange = (listingId, newQty) => {
        const item = items.find(i => i.id === listingId);
        if (item && item.stock !== undefined && item.stock !== null && newQty > item.stock) {
            toast.error(`Only ${item.stock} item(s) available in stock`);
            return;
        }
        updateQtyMutation.mutate({ listingId, quantity: newQty });
    };

    if (isLoaded && !user) {
        return (
            <div className="min-h-[70vh] mx-6 flex flex-col items-center justify-center text-center">
                <div className="size-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 mb-4">
                    <ShoppingBag size={28} />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Please sign in to view your cart</h2>
                <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
                    Sign in to see saved items, checkout with delivery addresses, and apply coupon discounts.
                </p>
                <button 
                    onClick={openSignIn} 
                    className="bg-indigo-600 text-white text-sm px-6 py-2.5 rounded-full hover:bg-indigo-700 transition font-medium"
                >
                    Sign In
                </button>
            </div>
        );
    }

    if (isLoading && items.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
                <div className="inline-block size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-sm">Loading your cart...</span>
            </div>
        );
    }

    return items.length > 0 ? (
        <div className="min-h-screen mx-6 text-slate-800">
            <div className="max-w-7xl mx-auto">
                {/* Title */}
                <PageTitle heading="My Cart" text={`${items.length} item(s) in your cart`} linkText="Add more" />

                <div className="flex items-center gap-2 mb-6 p-3 bg-amber-50 text-amber-800 rounded-lg text-xs sm:text-sm border border-amber-200">
                    <InfoIcon size={16} className="shrink-0" />
                    <span>Cart is for Buy It Now orders. For live auctions, check your bids under My Activity.</span>
                </div>

                <div className="flex items-start justify-between gap-8 max-lg:flex-col pb-24">
                    <div className="w-full max-w-4xl overflow-x-auto">
                        <table className="w-full text-slate-600 table-auto border-collapse">
                            <thead>
                                <tr className="max-sm:text-sm border-b border-slate-200 text-slate-400 text-xs uppercase tracking-wider">
                                    <th className="text-left py-3 font-semibold">Item</th>
                                    <th className="py-3 text-center font-semibold">Quantity</th>
                                    <th className="py-3 text-center font-semibold">Total Price</th>
                                    <th className="py-3 text-center font-semibold">Remove</th>
                                </tr>
                            </thead>
                            <tbody>
                                {items.map((item) => {
                                    const unitPrice = item.buyNowPrice || item.price || 0;
                                    const qty = item.quantity || 1;
                                    const itemTotal = unitPrice * qty;

                                    return (
                                        <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition">
                                            <td className="flex gap-4 py-4">
                                                <div className="relative size-18 rounded-xl bg-[#F8FAFC] border border-slate-200/80 overflow-hidden shrink-0 flex items-center justify-center">
                                                    <Image 
                                                        src={item.images?.[0] || '/placeholder.png'} 
                                                        className="object-contain p-1.5" 
                                                        alt={item.name} 
                                                        fill
                                                        sizes="72px"
                                                    />
                                                </div>
                                                <div className="flex flex-col justify-center">
                                                    <Link href={`/product/${item.id}`} className="max-sm:text-sm font-semibold text-slate-800 hover:text-indigo-600 transition">
                                                        {item.name}
                                                    </Link>
                                                    <p className="text-xs text-slate-400 capitalize">{item.category}</p>
                                                    <p className="text-sm font-medium text-slate-700 mt-1">
                                                        {currency}{unitPrice.toLocaleString()}
                                                    </p>
                                                    {(!item.inStock || (item.stock !== undefined && item.stock <= 0)) ? (
                                                        <span className="text-[11px] text-red-600 font-medium mt-0.5">Out of stock</span>
                                                    ) : item.stock !== undefined && item.stock !== null && item.stock <= 3 ? (
                                                        <span className="text-[11px] text-amber-600 font-medium mt-0.5">Only {item.stock} left</span>
                                                    ) : null}
                                                </div>
                                            </td>
                                            <td className="text-center py-4">
                                                <Counter 
                                                    productId={item.id} 
                                                    quantity={qty} 
                                                    max={item.stock}
                                                    onUpdate={(newQty) => handleQtyChange(item.id, newQty)} 
                                                />
                                            </td>
                                            <td className="text-center font-semibold text-slate-800 py-4">
                                                {currency}{itemTotal.toLocaleString()}
                                            </td>
                                            <td className="text-center py-4">
                                                <button 
                                                    onClick={() => handleRemove(item.id)} 
                                                    disabled={removeMutation.isPending}
                                                    title="Remove item"
                                                    className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-2 rounded-full active:scale-95 transition cursor-pointer"
                                                >
                                                    <Trash2Icon size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Order Summary Checkout Component */}
                    <OrderSummary totalPrice={totalPrice} items={items} />
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-[70vh] mx-6 flex flex-col items-center justify-center text-center">
            <div className="size-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-4">
                <ShoppingBag size={30} />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Your cart is empty</h1>
            <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
                Looks like you haven't added any items yet. Explore the shop to find great deals!
            </p>
            <Link 
                href="/shop" 
                className="bg-indigo-600 text-white text-sm px-6 py-2.5 rounded-full hover:bg-indigo-700 transition font-medium"
            >
                Start Shopping
            </Link>
        </div>
    );
}

export default function Cart() {
    return (
        <Suspense fallback={<div className="min-h-[70vh] flex items-center justify-center text-slate-400">Loading cart...</div>}>
            <CartContent />
        </Suspense>
    );
}