'use client'
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { CircleDollarSignIcon, ShoppingBasketIcon, UsersIcon, GavelIcon } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { fetchAdminDashboard } from "@/lib/api"

export default function AdminDashboard() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'

    const { data: dashboardData, isLoading, error } = useQuery({
        queryKey: ['admin-dashboard'],
        queryFn: fetchAdminDashboard,
    })

    if (isLoading) return <Loading />

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
                <p className="font-semibold">Failed to load admin metrics</p>
                <p className="text-xs text-red-400 mt-1">{error.message}</p>
            </div>
        )
    }

    const data = dashboardData || {
        totalListings: 0,
        revenue: 0,
        totalTransactions: 0,
        activeAuctions: 0,
        allOrders: [],
    }

    const dashboardCardsData = [
        { title: 'Total Listings', value: data.totalListings, icon: ShoppingBasketIcon },
        { title: 'Total Revenue', value: `${currency}${Number(data.revenue || 0).toLocaleString()}`, icon: CircleDollarSignIcon },
        { title: 'Transactions', value: data.totalTransactions, icon: UsersIcon },
        { title: 'Live Auctions', value: data.activeAuctions, icon: GavelIcon },
    ]

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

            {/* Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 my-8">
                {dashboardCardsData.map((card, index) => (
                    <div key={index} className="flex items-center justify-between border border-slate-200 bg-white p-5 px-6 rounded-2xl shadow-xs hover:border-slate-300 transition">
                        <div className="flex flex-col gap-1 text-xs">
                            <p className="text-slate-400 font-medium">{card.title}</p>
                            <b className="text-2xl font-bold text-slate-800">{card.value}</b>
                        </div>
                        <card.icon size={44} className="w-11 h-11 p-2.5 text-indigo-600 bg-indigo-50 rounded-xl shrink-0" />
                    </div>
                ))}
            </div>

            {/* Area Chart */}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
                <OrdersAreaChart allOrders={data.allOrders || []} />
            </div>
        </div>
    )
}