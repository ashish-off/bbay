'use client'
import ProductDescription from "@/components/ProductDescription";
import ProductDetails from "@/components/ProductDetails";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export default function Product() {

    const { productId } = useParams();
    const [product, setProduct] = useState();
    const products = useSelector(state => state.product.list);

    const fetchProduct = async () => {
        const found = products.find((p) => p.id === productId);
        setProduct(found);
    }

    useEffect(() => {
        if (products.length > 0) {
            fetchProduct()
        }
        scrollTo(0, 0)
    }, [productId, products]);

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
                    {product?.category && (
                        <>
                            <ChevronRight size={14} className="text-slate-400" />
                            <Link 
                                href={`/shop?search=${encodeURIComponent(product.category)}`}
                                className="hover:text-indigo-600 transition"
                            >
                                {product.category}
                            </Link>
                        </>
                    )}
                    {product?.name && (
                        <>
                            <ChevronRight size={14} className="text-slate-400" />
                            <span className="text-slate-800 font-medium truncate max-w-xs sm:max-w-md">
                                {product.name}
                            </span>
                        </>
                    )}
                </nav>

                {/* Product Details */}
                {product && (<ProductDetails product={product} />)}

                {/* Description & Reviews */}
                {product && (<ProductDescription product={product} />)}
            </div>
        </div>
    );
}