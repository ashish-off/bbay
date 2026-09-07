'use client'
import { usePathname } from "next/navigation"
import { HomeIcon, LayoutListIcon, SquarePenIcon, SquarePlusIcon } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"

const SellerSidebar = () => {

    const pathname = usePathname()
    const { user, isLoaded } = useUser()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/sell', icon: HomeIcon },
        { name: 'Create Listing', href: '/sell/create-listing', icon: SquarePlusIcon },
        { name: 'My Listings', href: '/sell/my-listings', icon: SquarePenIcon },
        { name: 'Sales & Orders', href: '/sell/orders', icon: LayoutListIcon },
    ]

    const displayName = user ? (user.fullName || user.firstName || user.username || 'bbay Seller') : 'Seller'
    const avatarUrl = user?.imageUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=200'

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60 bg-white">
            <div className="flex flex-col gap-2 justify-center items-center pt-8 max-sm:hidden px-4 text-center">
                <Image className="w-14 h-14 rounded-full shadow-sm object-cover border border-slate-200" src={avatarUrl} alt={displayName} width={80} height={80} />
                <p className="text-slate-700 font-medium text-sm truncate max-w-[180px]">{displayName}</p>
                <span className="text-[11px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-medium border border-emerald-100">Verified Seller</span>
            </div>

            <div className="max-sm:mt-6">
                {
                    sidebarLinks.map((link, index) => (
                        <Link key={index} href={link.href} className={`relative flex items-center gap-3 text-slate-500 hover:bg-slate-50 p-2.5 transition text-sm ${pathname === link.href && 'bg-indigo-50 sm:text-indigo-600 font-medium'}`}>
                            <link.icon size={18} className="sm:ml-5" />
                            <p className="max-sm:hidden">{link.name}</p>
                            {pathname === link.href && <span className="absolute bg-indigo-600 right-0 top-1.5 bottom-1.5 w-1 sm:w-1.5 rounded-l"></span>}
                        </Link>
                    ))
                }
            </div>
        </div>
    )
}

export default SellerSidebar