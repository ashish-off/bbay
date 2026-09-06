'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import Loading from "@/components/Loading";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { fetchListing } from "@/lib/api";
import Link from "next/link";
import { ChevronRight, AlertCircle } from "lucide-react";

export default function Product() {
    const { productId } = useParams();

    const { data: product, isLoading, error } = useQuery({
        queryKey: ['listing', productId],
        queryFn: () => fetchListing(productId),
        enabled: Boolean(productId),
    });

    if (isLoading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <Loading />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
                <AlertCircle size={48} className="text-slate-400 mb-4" />
                <h1 className="text-2xl font-semibold text-slate-800">Listing Not Found</h1>
                <p className="text-slate-500 text-sm mt-1 max-w-md">
                    This item may have ended, been removed, or the link is invalid.
                </p>
                <Link 
                    href="/shop" 
                    className="mt-6 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full transition"
                >
                    Browse All Listings
                </Link>
            </div>
        );
    }

    return (
        <div className="mx-6">
            <div className="max-w-7xl mx-auto">
                {/* Clickable Breadcrumbs */}
                <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-slate-500 text-sm mt-8 mb-6">
                    <Link href="/" className="hover:text-indigo-600 transition">
                        Home
                    </Link>
                    <ChevronRight size={14} className="text-slate-400" />
                    <Link href="/shop" className="hover:text-indigo-600 transition">
                        Listings
                    </Link>
                    {product.category && (
                        <>
                            <ChevronRight size={14} className="text-slate-400" />
                            <Link 
                                href={`/shop?category=${encodeURIComponent(product.category)}`}
                                className="hover:text-indigo-600 transition"
                            >
                                {product.category}
                            </Link>
                        </>
                    )}
                    {product.name && (
                        <>
                            <ChevronRight size={14} className="text-slate-400" />
                            <span className="text-slate-800 font-medium truncate max-w-xs sm:max-w-md">
                                {product.name}
                            </span>
                        </>
                    )}
                </nav>

                {/* Product Details */}
                <ProductDetails product={product} />

                {/* Description & Reviews */}
                <ProductDescription product={product} />
            </div>
        </div>
    );
}