'use client'
import Link from "next/link"
import { Gavel } from "lucide-react"

const AdminNavbar = () => {
    return (
        <div className="flex items-center justify-between px-6 sm:px-12 py-3 border-b border-slate-200 transition-all bg-white">
            <Link href="/" className="relative text-3xl font-bold text-slate-800 tracking-tight inline-flex items-center gap-1">
                <span className="text-indigo-600">b</span>bay
                <Gavel size={14} className="text-indigo-500 rotate-45" />
                <span className="text-xs font-semibold ml-2 px-2.5 py-0.5 rounded-full text-indigo-700 bg-indigo-100">
                    Admin
                </span>
            </Link>
            <div className="flex items-center gap-3 text-sm text-slate-600">
                <p>Hi, Admin</p>
            </div>
        </div>
    )
}

export default AdminNavbar