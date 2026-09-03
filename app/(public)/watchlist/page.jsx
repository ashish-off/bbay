'use client'
import PageTitle from "@/components/PageTitle";
import ProductCard from "@/components/ProductCard";
import { useSelector } from "react-redux";
import Link from "next/link";
import { Heart } from "lucide-react";

export default function WatchlistPage() {
    const watchlist = useSelector(state => state.watchlist.items);
    const products = useSelector(state => state.product.list);

    const watchedProducts = products.filter(p => watchlist.includes(p.id));

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
                            className="bg-indigo-600 text-white text-sm px-6 py-2.5 rounded-full hover:bg-indigo-700 transition"
                        >
                            Explore Listings
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
