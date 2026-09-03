'use client'

import { usePathname } from "next/navigation"
import { HomeIcon, ShieldCheckIcon, UsersIcon, TicketPercentIcon } from "lucide-react"
import Link from "next/link"

const AdminSidebar = () => {

    const pathname = usePathname()

    const sidebarLinks = [
        { name: 'Dashboard', href: '/admin', icon: HomeIcon },
        { name: 'Users', href: '/admin/users', icon: UsersIcon },
        { name: 'Listings', href: '/admin/listings', icon: ShieldCheckIcon },
        { name: 'Coupons', href: '/admin/coupons', icon: TicketPercentIcon },
    ]

    return (
        <div className="inline-flex h-full flex-col gap-5 border-r border-slate-200 sm:min-w-60 bg-white">
            <div className="flex flex-col gap-1 justify-center items-center pt-8 max-sm:hidden">
                <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                    A
                </div>
                <p className="text-slate-800 font-medium text-sm mt-2">bbay Admin</p>
                <span className="text-[11px] text-slate-400">System Administrator</span>
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

export default AdminSidebar