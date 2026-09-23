'use client'
import { assets } from '@/assets/assets'
import { ArrowRightIcon, ChevronRightIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'
import CategoriesMarquee from './CategoriesMarquee'

const Hero = () => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'

    return (
        <div className='mx-6'>
            <div className='flex max-xl:flex-col gap-8 max-w-7xl mx-auto my-10'>
                <div className='relative flex-1 flex flex-col bg-indigo-100 rounded-3xl xl:min-h-100 group'>
                    <div className='p-5 sm:p-16'>
                        <div className='inline-flex items-center gap-3 bg-indigo-200 text-indigo-700 pr-4 p-1 rounded-full text-xs sm:text-sm'>
                            <span className='bg-indigo-600 px-3 py-1 max-sm:ml-1 rounded-full text-white text-xs'>LIVE</span>New auctions every day! <ChevronRightIcon className='group-hover:ml-2 transition-all' size={16} />
                        </div>
                        <h2 className='text-3xl sm:text-5xl leading-[1.2] my-3 font-medium bg-gradient-to-r from-slate-700 to-indigo-500 bg-clip-text text-transparent max-w-xs sm:max-w-md'>
                            Bid. Win. Save. Nepal&apos;s Auction Marketplace.
                        </h2>
                        <div className='text-slate-800 text-sm font-medium mt-4 sm:mt-8'>
                            <p>Bids starting from</p>
                            <p className='text-3xl'>{currency}100</p>
                        </div>
                        <Link href="/shop?type=auction" className='inline-block bg-indigo-600 text-white text-sm px-8 py-2 rounded-full sm:py-5 sm:px-12 mt-4 sm:mt-10 hover:bg-indigo-700 hover:scale-103 active:scale-95 transition font-medium'>
                            START BIDDING
                        </Link>
                    </div>
                    <Image className='sm:absolute bottom-0 right-0 md:right-10 w-full sm:max-w-sm' src={assets.herohike} alt="hero image" />
                </div>
                <div className='flex flex-col md:flex-row xl:flex-col gap-5 w-full xl:max-w-sm text-sm text-slate-600'>
                    {/* Hot Auctions Card */}
                    <Link href="/shop?type=auction" className='flex-1 flex items-center justify-between w-full bg-amber-100 rounded-3xl p-6 px-8 group cursor-pointer hover:shadow-md transition-all'>
                        <div>
                            <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-amber-600 bg-clip-text text-transparent max-w-40'>🔥 Hot Auctions</p>
                            <p className='flex items-center gap-1 mt-4 font-medium text-amber-900'>Bid now <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        <Image className='w-35' src={assets.hero_product_img1} alt="" />
                    </Link>

                    {/* Buy It Now Card */}
                    <Link href="/shop?type=fixed" className='flex-1 flex items-center justify-between w-full bg-emerald-100 rounded-3xl p-6 px-8 group cursor-pointer hover:shadow-md transition-all'>
                        <div>
                            <p className='text-3xl font-medium bg-gradient-to-r from-slate-800 to-emerald-600 bg-clip-text text-transparent max-w-40'>Buy It Now</p>
                            <p className='flex items-center gap-1 mt-4 font-medium text-emerald-900'>Fixed price deals <ArrowRightIcon className='group-hover:ml-2 transition-all' size={18} /> </p>
                        </div>
                        <Image className='w-35' src={assets.hero_product_img2} alt="" />
                    </Link>
                </div>
            </div>
            <CategoriesMarquee />
        </div>

    )
}

export default Hero