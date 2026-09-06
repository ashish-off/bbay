'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useQuery } from '@tanstack/react-query'
import { fetchListings } from '@/lib/api'

const LiveAuctions = () => {

    const displayQuantity = 4

    const { data, isLoading } = useQuery({
        queryKey: ['listings', { type: 'AUCTION' }],
        queryFn: () => fetchListings({ type: 'AUCTION', limit: 10 }),
    })

    const auctionProducts = data?.listings || []

    if (!isLoading && auctionProducts.length === 0) {
        return null // Don't show empty block if no auctions
    }

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title 
                title='🔴 Live Auctions' 
                description={`Showing ${Math.min(auctionProducts.length, displayQuantity)} of ${auctionProducts.length} live auctions`} 
                href='/shop?type=auction' 
            />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-start'>
                {auctionProducts.slice(0, displayQuantity).map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>
        </div>
    )
}

export default LiveAuctions
