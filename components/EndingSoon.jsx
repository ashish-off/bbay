'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useQuery } from '@tanstack/react-query'
import { fetchListings } from '@/lib/api'

const EndingSoon = () => {

    const displayQuantity = 8

    const { data, isLoading } = useQuery({
        queryKey: ['listings', { type: 'AUCTION', sort: 'endingSoon' }],
        queryFn: () => fetchListings({ type: 'AUCTION', sort: 'endingSoon', limit: 12 }),
    })

    const endingSoon = data?.listings || []

    if (!isLoading && endingSoon.length === 0) {
        return null
    }

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title 
                title='⏰ Ending Soon' 
                description={`Don't miss out — ${endingSoon.length} auctions ending soon`} 
                href='/shop?type=auction' 
            />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {endingSoon.slice(0, displayQuantity).map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default EndingSoon
