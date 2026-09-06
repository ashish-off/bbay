'use client'
import Loading from "../Loading"
import Link from "next/link"
import { ArrowRightIcon, ShieldAlert } from "lucide-react"
import AdminNavbar from "./AdminNavbar"
import AdminSidebar from "./AdminSidebar"
import { useQuery } from "@tanstack/react-query"
import { checkAdminStatus } from "@/lib/api"

const AdminLayout = ({ children }) => {

    const { data, isLoading } = useQuery({
        queryKey: ['admin-check'],
        queryFn: checkAdminStatus,
        staleTime: 60 * 1000,
    })

    const isAdmin = Boolean(data?.isAdmin)

    return isLoading ? (
        <div className="min-h-screen flex items-center justify-center">
            <Loading />
        </div>
    ) : isAdmin ? (
        <div className="flex flex-col h-screen">
            <AdminNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <AdminSidebar />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    ) : (
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
            <ShieldAlert size={56} className="text-red-500 mb-4" />
            <h1 className="text-2xl sm:text-3xl font-semibold text-slate-800">Admin Access Required</h1>
            <p className="text-sm text-slate-500 mt-2 max-w-md">
                You are not authorized to view the admin control panel. Please sign in with an authorized admin account.
            </p>
            <Link href="/" className="bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-2 mt-6 py-2.5 px-6 text-sm font-medium rounded-full transition">
                Go to home <ArrowRightIcon size={16} />
            </Link>
        </div>
    )
}

export default AdminLayout