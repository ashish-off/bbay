'use client'
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
const SellerNavbar = () => {
    const { user } = useUser()
    const displayName = user ? (user.firstName || user.username || 'bbay Seller') : 'Seller'
    return (
        <div className="flex items-center justify-between px-6 sm:px-12 py-3 border-b border-slate-200 transition-all bg-white">
            <Link href="/" className="relative text-3xl font-bold text-slate-800 tracking-tight">
                <span className="text-indigo-600">B</span>bay
                <span className="text-xs font-semibold ml-2 px-2.5 py-0.5 rounded-full text-indigo-700 bg-indigo-100">
                    Seller
                </span>
            </Link>
            <div className="flex items-center gap-3 text-sm text-slate-600">
                <p>Hi, {displayName}</p>
            </div>
        </div>
    )
}

export default SellerNavbar