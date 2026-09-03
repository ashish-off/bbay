'use client'
import { Suspense, useEffect, useState } from "react"
import ProductCard from "@/components/ProductCard"
import { MoveLeftIcon } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSelector } from "react-redux"

function ShopContent() {
    const searchParams = useSearchParams()
    const search = searchParams.get('search')
    const typeParam = searchParams.get('type')
    const router = useRouter()

    const [listingFilter, setListingFilter] = useState('all') // 'all' | 'auction' | 'fixed'

    useEffect(() => {
        if (typeParam === 'auction' || typeParam === 'fixed') {
            setListingFilter(typeParam)
        } else {
            setListingFilter('all')
        }
    }, [typeParam])

    const products = useSelector(state => state.product.list)

    const filteredProducts = products.filter(product => {
        const matchesSearch = search 
            ? product.name.toLowerCase().includes(search.toLowerCase()) || product.category.toLowerCase().includes(search.toLowerCase())
            : true;
        
        let matchesType = true;
        if (listingFilter === 'auction') {
            matchesType = product.listingType === 'auction';
        } else if (listingFilter === 'fixed') {
            matchesType = product.listingType === 'fixed' || Boolean(product.buyNowPrice);
        }

        return matchesSearch && matchesType;
    });

    const handleFilterChange = (type) => {
        setListingFilter(type)
        if (type === 'all') {
            router.push('/shop')
        } else {
            router.push(`/shop?type=${type}`)
        }
    }

    return (
        <div className="min-h-[70vh] mx-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 my-6">
                    <h1 onClick={() => router.push('/shop')} className="text-2xl text-slate-500 flex items-center gap-2 cursor-pointer">
                        {search && <MoveLeftIcon size={20} />} All <span className="text-slate-700 font-medium">Listings</span>
                    </h1>
                    
                    {/* Filter buttons */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg text-xs sm:text-sm">
                        <button 
                            onClick={() => handleFilterChange('all')} 
                            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${listingFilter === 'all' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                        >
                            All
                        </button>
                        <button 
                            onClick={() => handleFilterChange('auction')} 
                            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${listingFilter === 'auction' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-500 hover:text-indigo-600'}`}
                        >
                            🔨 Auctions
                        </button>
                        <button 
                            onClick={() => handleFilterChange('fixed')} 
                            className={`px-3 py-1.5 rounded-md font-medium transition cursor-pointer ${listingFilter === 'fixed' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-emerald-600'}`}
                        >
                            🛒 Buy It Now
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12 mx-auto mb-32">
                    {filteredProducts.length > 0 ? (
                        filteredProducts.map((product) => <ProductCard key={product.id} product={product} />)
                    ) : (
                        <div className="py-20 text-center w-full text-slate-400">
                            No listings match your criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default function Shop() {
    return (
        <Suspense fallback={<div className="p-10 text-center text-slate-400">Loading listings...</div>}>
            <ShopContent />
        </Suspense>
    );
}