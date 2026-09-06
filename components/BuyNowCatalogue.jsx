'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useQuery } from '@tanstack/react-query'
import { fetchListings } from '@/lib/api'

const BuyNowCatalogue = () => {

    const displayQuantity = 8

    const { data, isLoading } = useQuery({
        queryKey: ['listings', { type: 'FIXED' }],
        queryFn: () => fetchListings({ type: 'FIXED', limit: 12 }),
    })

    const buyNowProducts = data?.listings || []

    if (!isLoading && buyNowProducts.length === 0) {
        return null
    }

    return (
        <div className='px-6 my-28 max-w-6xl mx-auto'>
            <Title 
                title='🛒 Buy It Now Catalogue' 
                description={`Direct purchase items — ${buyNowProducts.length} items ready to ship`} 
                href='/shop?type=fixed' 
            />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {buyNowProducts.slice(0, displayQuantity).map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BuyNowCatalogue
