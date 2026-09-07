'use client'
import PageTitle from "@/components/PageTitle";
import ProductCard from "@/components/ProductCard";
import Link from "next/link";
import { Heart } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchWatchlist, clientCache } from "@/lib/api";
import { useUser, useClerk } from "@clerk/nextjs";

export default function WatchlistPage() {
    const { user, isLoaded } = useUser();
    const { openSignIn } = useClerk();

    const { data: watchedProducts = [], isLoading } = useQuery({
        queryKey: ['watchlist'],
        queryFn: fetchWatchlist,
        enabled: Boolean(user),
        initialData: () => clientCache.get('watchlist') || undefined,
    });

    if (isLoaded && !user) {
        return (
            <div className="min-h-[70vh] mx-6 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
                    <Heart size={30} />
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Please sign in to view your watchlist</h2>
                <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
                    Sign in to track live auctions, save deals for later, and get notified before bidding closes.
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

    if (isLoading && watchedProducts.length === 0) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center text-slate-400">
                <div className="inline-block size-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-3 text-sm">Loading your watchlist...</span>
            </div>
        );
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="my-16 max-w-7xl mx-auto">
                <PageTitle 
                    heading="My Watchlist" 
                    text={`Tracking ${watchedProducts.length} item(s)`} 
                    linkText="Browse listings" 
                />

                {watchedProducts.length > 0 ? (
                    <div className="mt-8 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mb-32">
                        {watchedProducts.map((product) => (
                            <ProductCard key={product.id} product={product} />
                        ))}
                    </div>
                ) : (
                    <div className="py-24 flex flex-col items-center justify-center text-center">
                        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 mb-4">
                            <Heart size={30} />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-800">Your watchlist is empty</h2>
                        <p className="text-sm text-slate-400 max-w-sm mt-1 mb-6">
                            Tap the heart icon on any auction or Buy It Now item to track it here.
                        </p>
                        <Link 
                            href="/shop" 
                            className="bg-indigo-600 text-white text-sm px-6 py-2.5 rounded-full hover:bg-indigo-700 transition font-medium"
                        >
                            Explore Listings
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
