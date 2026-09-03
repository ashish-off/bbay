'use client'
import { dummyAdminDashboardData } from "@/assets/assets"
import Loading from "@/components/Loading"
import OrdersAreaChart from "@/components/OrdersAreaChart"
import { CircleDollarSignIcon, ShoppingBasketIcon, UsersIcon, GavelIcon } from "lucide-react"
import { useEffect, useState } from "react"

export default function AdminDashboard() {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'

    const [loading, setLoading] = useState(true)
    const [dashboardData, setDashboardData] = useState({
        totalListings: 0,
        revenue: 0,
        totalTransactions: 0,
        activeAuctions: 0,
        allOrders: [],
    })

    const dashboardCardsData = [
        { title: 'Total Listings', value: dashboardData.totalListings, icon: ShoppingBasketIcon },
        { title: 'Total Revenue', value: currency + Number(dashboardData.revenue).toLocaleString(), icon: CircleDollarSignIcon },
        { title: 'Transactions', value: dashboardData.totalTransactions, icon: UsersIcon },
        { title: 'Live Auctions', value: dashboardData.activeAuctions, icon: GavelIcon },
    ]

    const fetchDashboardData = async () => {
        setDashboardData(dummyAdminDashboardData)
        setLoading(false)
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="text-slate-500">
            <h1 className="text-2xl">Admin <span className="text-slate-800 font-medium">Dashboard</span></h1>

            {/* Cards */}
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

            {/* Area Chart */}
            <OrdersAreaChart allOrders={dashboardData.allOrders} />
        </div>
    )
}