'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const EndingSoon = () => {

    const displayQuantity = 8
    const products = useSelector(state => state.product.list)
    const endingSoon = products
        .filter(p => p.listingType === 'auction' && p.auctionEndTime)
        .sort((a, b) => new Date(a.auctionEndTime) - new Date(b.auctionEndTime))

    return (
        <div className='px-6 my-30 max-w-6xl mx-auto'>
            <Title title='⏰ Ending Soon' description={`Don't miss out — ${endingSoon.length} auctions ending soon`} href='/shop' />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {endingSoon.slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default EndingSoon
