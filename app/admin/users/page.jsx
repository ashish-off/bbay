'use client'
import Loading from "@/components/Loading"
import toast from "react-hot-toast"
import Image from "next/image"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchAdminUsers, toggleUserActiveApi } from "@/lib/api"
import { UserCheck, UserX } from "lucide-react"

export default function AdminUsers() {
    const queryClient = useQueryClient()

    const { data: users = [], isLoading, error } = useQuery({
        queryKey: ['admin-users'],
        queryFn: fetchAdminUsers,
    })

    const toggleMutation = useMutation({
        mutationFn: toggleUserActiveApi,
        onSuccess: (updated) => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] })
            toast.success(`User ${updated.isActive ? 'activated' : 'suspended'}`)
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update user status')
        }
    })

    const handleToggleStatus = (userId) => {
        toggleMutation.mutate(userId)
    }

    if (isLoading) return <Loading />

    if (error) {
        return (
            <div className="p-8 text-center text-red-500 bg-red-50 rounded-xl border border-red-200">
                <p className="font-semibold">Failed to load users</p>
                <p className="text-xs text-red-400 mt-1">{error.message}</p>
            </div>
        )
    }

    return (
        <div className="text-slate-500 mb-28">
            <h1 className="text-2xl">Manage <span className="text-slate-800 font-medium">Users</span></h1>
            <p className="text-xs text-slate-400 mt-1">Real users synchronized from Clerk & PostgreSQL</p>

            {users.length ? (
                <div className="flex flex-col gap-4 mt-6 max-w-4xl">
                    {users.map((user) => (
                        <div key={user.id} className="bg-white border border-slate-200 rounded-2xl p-5 flex max-md:flex-col justify-between items-center gap-4 shadow-xs hover:border-slate-300 transition">
                            <div className="flex items-center gap-4">
                                <div className="relative size-12 rounded-full overflow-hidden border border-slate-200 shrink-0 bg-slate-100">
                                    <Image 
                                        src={user.image || '/placeholder.png'} 
                                        alt={user.name || 'User'} 
                                        fill 
                                        sizes="48px"
                                        className="object-cover" 
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-slate-800">{user.name || 'Unnamed User'}</h3>
                                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${user.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                                            {user.isActive ? 'Active' : 'Suspended'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-400">{user.email}</p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Listings: <strong>{user._count?.listings ?? 0}</strong> · 
                                        Purchases: <strong>{user._count?.buyerOrders ?? 0}</strong> · 
                                        Sales: <strong>{user._count?.sellerOrders ?? 0}</strong> · 
                                        Bids: <strong>{user._count?.bids ?? 0}</strong>
                                    </p>
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-500 font-medium">
                                    {user.isActive ? 'Active' : 'Suspended'}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        onChange={() => handleToggleStatus(user.id)} 
                                        checked={Boolean(user.isActive)} 
                                        disabled={toggleMutation.isPending}
                                    />
                                    <div className="w-10 h-5.5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                                    <span className="absolute left-0.5 top-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform peer-checked:translate-x-4.5 shadow-xs"></span>
                                </label>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-center h-80">
                    <h1 className="text-2xl text-slate-400 font-medium">No users found in database</h1>
                </div>
            )}
        </div>
    )
}