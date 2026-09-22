'use client'
import Loading from "@/components/Loading"
import { CircleDollarSignIcon, ShoppingBasketIcon, StarIcon, GavelIcon, PlusIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { fetchSellerDashboard } from "@/lib/api"
import { useUser } from "@clerk/nextjs"

export default function Dashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'
    const router = useRouter()
    const { user, isLoaded } = useUser()

    const { data: dashboardData, isLoading, error } = useQuery({
        queryKey: ['seller-dashboard'],
        queryFn: fetchSellerDashboard,
        enabled: Boolean(user),
        staleTime: 60 * 1000,
    })

    const stats = {
        activeListings: dashboardData?.activeListings || 0,
        totalEarnings: dashboardData?.totalEarnings || 0,
        totalOrders: dashboardData?.totalOrders || 0,
        itemsSold: dashboardData?.itemsSold ?? dashboardData?.totalOrders ?? 0,
        activeAuctions: dashboardData?.activeAuctions || 0,
        ratings: dashboardData?.ratings || [],
    }

    const dashboardCardsData = [
        { title: 'Active Listings', value: stats.activeListings, icon: ShoppingBasketIcon },
        { title: 'Total Earnings', value: currency + Number(stats.totalEarnings).toLocaleString(), icon: CircleDollarSignIcon },
        { title: 'Items Sold', value: stats.itemsSold, icon: StarIcon },
        { title: 'Live Auctions', value: stats.activeAuctions, icon: GavelIcon },
    ]

    if (!isLoaded || isLoading) return <Loading />

    return (
        <div className="text-slate-500 mb-28">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div>
                    <h1 className="text-2xl">Seller <span className="text-slate-800 font-medium">Dashboard</span></h1>
                    <p className="text-xs text-slate-400 mt-1">Real-time overview of your store performance and ratings</p>
                </div>
                <Link href="/sell/create-listing" className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium px-4 py-2 rounded-lg transition shadow-xs">
                    <PlusIcon size={16} /> Create Listing
                </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-8">
                {
                    dashboardCardsData.map((card, index) => (
                        <div key={index} className="flex items-center justify-between border border-slate-200 bg-white p-5 rounded-xl shadow-xs">
                            <div className="flex flex-col gap-1.5">
                                <p className="text-slate-500 text-xs">{card.title}</p>
                                <b className="text-2xl font-bold text-slate-800">{card.value}</b>
                            </div>
                            <card.icon size={42} className="w-11 h-11 p-2.5 text-indigo-600 bg-indigo-50 rounded-full" />
                        </div>
                    ))
                }
            </div>

            <h2 className="text-lg font-medium text-slate-800 mb-4">Recent Reviews on Your Items</h2>

            <div className="mt-2 space-y-3">
                {
                    stats.ratings.length === 0 ? (
                        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-sm">
                            No customer reviews yet. Start selling items to receive reviews!
                        </div>
                    ) : (
                        stats.ratings.map((review, index) => {
                            const listing = review.listing || review.product
                            const reviewerName = review.user?.name || 'Customer'
                            const reviewerImage = review.user?.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'

                            return (
                                <div key={index} className="flex max-sm:flex-col gap-5 sm:items-center justify-between py-4 border border-slate-200 text-sm text-slate-600 max-w-4xl bg-white p-4 rounded-xl shadow-xs">
                                    <div className="flex-1">
                                        <div className="flex gap-3 items-center">
                                            <Image src={reviewerImage} alt={reviewerName} className="w-9 h-9 rounded-full object-cover border border-slate-200" width={100} height={100} />
                                            <div>
                                                <p className="font-medium text-slate-800">{reviewerName}</p>
                                                <p className="font-light text-xs text-slate-400">{new Date(review.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <p className="mt-2 text-slate-600 leading-relaxed text-xs sm:text-sm">{review.review || 'No review message provided'}</p>
                                    </div>
                                    <div className="flex flex-col justify-between gap-3 sm:items-end">
                                        <div className="flex flex-col sm:items-end">
                                            <span className="text-[11px] uppercase tracking-wider text-slate-400 font-medium">{listing?.category || 'General'}</span>
                                            <p className="font-medium text-slate-700 text-sm">{listing?.name || 'Item'}</p>
                                            <div className='flex items-center mt-1'>
                                                {Array(5).fill('').map((_, idx) => (
                                                    <StarIcon key={idx} size={14} className='text-transparent' fill={review.rating >= idx + 1 ? "#00C950" : "#D1D5DB"} />
                                                ))}
                                            </div>
                                        </div>
                                        {listing?.id && (
                                            <button onClick={() => router.push(`/product/${listing.id}`)} className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-lg transition font-medium">View Item</button>
                                        )}
                                    </div>
                                </div>
                            )
                        })
                    )
                }
            </div>
        </div>
    )
}