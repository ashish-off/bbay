'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const LiveAuctions = () => {

    const displayQuantity = 4
    const products = useSelector(state => state.product.list)
    const auctionProducts = products.filter(p => p.listingType === 'auction')

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='🔴 Live Auctions' description={`Showing ${auctionProducts.length < displayQuantity ? auctionProducts.length : displayQuantity} of ${auctionProducts.length} auctions`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 justify-between'>
                {auctionProducts.slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default LiveAuctions
