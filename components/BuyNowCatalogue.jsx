'use client'
import Title from './Title'
import ProductCard from './ProductCard'
import { useSelector } from 'react-redux'

const BuyNowCatalogue = () => {

    const displayQuantity = 8
    const products = useSelector(state => state.product.list)
    const buyNowProducts = products.filter(p => p.listingType === 'fixed' || p.buyNowPrice)

    return (
        <div className='px-6 my-28 max-w-6xl mx-auto'>
            <Title 
                title='🛒 Buy It Now Catalogue' 
                description={`Direct purchase items — ${buyNowProducts.length} items ready to ship`} 
                href='/shop' 
            />
            <div className='mt-12 grid grid-cols-2 sm:flex flex-wrap gap-6 xl:gap-12'>
                {buyNowProducts.slice(0, displayQuantity).map((product, index) => (
                    <ProductCard key={index} product={product} />
                ))}
            </div>
        </div>
    )
}

export default BuyNowCatalogue
