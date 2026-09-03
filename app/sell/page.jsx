'use client'
import { dummySellerDashboardData } from "@/assets/assets"
import Loading from "@/components/Loading"
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, GavelIcon } from "lucide-react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function Dashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'
    const router = useRouter()

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        activeListings: 0,
        totalEarnings: 0,
        totalOrders: 0,
        activeAuctions: 0,
        ratings: [],
    })

    const dashboardCardsData = [
        { title: 'Active Listings', value: dashboardData.activeListings, icon: ShoppingBasketIcon },
        { title: 'Total Earnings', value: currency + dashboardData.totalEarnings.toLocaleString(), icon: CircleDollarSignIcon },
        { title: 'Items Sold', value: dashboardData.totalOrders, icon: StarIcon },
        { title: 'Live Auctions', value: dashboardData.activeAuctions, icon: GavelIcon },
    ]

    const fetchDashboardData = async () => {
        setDashboardData(dummySellerDashboardData)
        setLoading(false)
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className=" text-slate-500 mb-28">
            <h1 className="text-2xl">Seller <span className="text-slate-800 font-medium">Dashboard</span></h1>

            <div className="flex flex-wrap gap-5 my-10 mt-4">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center gap-8 border border-slate-200 bg-white p-4 px-6 rounded-xl shadow-xs">
                            <div className="flex flex-col gap-2 text-xs">
                                <p className="text-slate-500">{card.title}</p>
                                <b className="text-2xl font-semibold text-slate-800">{card.value}</b>
                            </div>
                            <card.icon size={44} className="w-11 h-11 p-2.5 text-indigo-600 bg-indigo-50 rounded-full" />
                        </div>
                    ))
                }
            </div>

            <h2 className="text-lg font-medium text-slate-700">Recent Reviews on Your Items</h2>

            <div className="mt-5">
                {
                    dashboardData.ratings.map((review, index) => (
                        <div key={index} className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-5 border-b border-slate-200 text-sm text-slate-600 max-w-4xl bg-white p-4 rounded-lg my-2 border">
                            <div>
                                <div className="flex gap-3 items-center">
                                    <Image src={review.user.image} alt="" className="w-9 h-9 rounded-full object-cover" width={100} height={100} />
                                    <div>
                                        <p className="font-medium text-slate-800">{review.user.name}</p>
                                        <p className="font-light text-xs text-slate-400">{new Date(review.createdAt).toDateString()}</p>
                                    </div>
                                </div>
                                <p className="mt-2 text-slate-600 max-w-md leading-relaxed text-xs sm:text-sm">{review.review}</p>
                            </div>
                            <div className="flex flex-col justify-between gap-3 sm:items-end">
                                <div className="flex flex-col sm:items-end">
                                    <p className="text-xs text-slate-400">{review.product?.category}</p>
                                    <p className="font-medium text-slate-700">{review.product?.name}</p>
                                    <div className='flex items-center mt-1'>
                                        {Array(5).fill('').map((_, idx) => (
                                            <StarIcon key={idx} size={14} className='text-transparent' fill={review.rating >= idx + 1 ? "#00C950" : "#D1D5DB"} />
                                        ))}
                                    </div>
                                </div>
                                <button onClick={() => router.push(`/product/${review.product.id}`)} className="bg-slate-100 text-xs px-4 py-1.5 hover:bg-slate-200 rounded transition-all">View Item</button>
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}