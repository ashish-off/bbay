'use client'
import { dummyUsersData } from "@/assets/assets"
import Loading from "@/components/Loading"
import { useEffect, useState } from "react"
import toast from "react-hot-toast"
import Image from "next/image"

export default function AdminUsers() {

    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchUsers = async () => {
        setUsers(dummyUsersData)
        setLoading(false)
    }

    const toggleUserStatus = (userId) => {
        setUsers(users.map(u => {
            if (u.id === userId) {
                const nextStatus = !u.isActive
                toast.success(`User ${nextStatus ? 'activated' : 'suspended'}`)
                return { ...u, isActive: nextStatus }
            }
            return u
        }))
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    return !loading ? (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Manage <span className="text-slate-800 font-medium">Users</span></h1>

            {users.length ? (
                <div className="flex flex-col gap-4 mt-6 max-w-4xl">
                    {users.map((user) => (
                        <div key={user.id} className="bg-white border border-slate-200 rounded-xl p-5 flex max-md:flex-col justify-between items-center gap-4 shadow-xs">
                            <div className="flex items-center gap-4">
                                <Image src={user.image} alt={user.name} width={50} height={50} className="w-12 h-12 rounded-full object-cover border" />
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-800">{user.name}</h3>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400">{user.email}</p>
                                    <p className="text-xs text-slate-500 mt-1">Listings: {user.totalListings} · Sold: {user.totalSold}</p>
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500">{user.isActive ? 'Active' : 'Suspended'}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" className="sr-only peer" onChange={() => toggleUserStatus(user.id)} checked={user.isActive} />
                                    <div className="w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                                    <span className="dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-4"></span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-3xl text-slate-400 font-medium">No users found</h1>
                </div>
            )}
        </div>
    ) : <Loading />
}