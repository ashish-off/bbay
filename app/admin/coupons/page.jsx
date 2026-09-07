'use client'
import { useState } from "react"
import { format } from "date-fns"
import toast from "react-hot-toast"
import { Trash2, Plus, Ticket } from "lucide-react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchCoupons, createCouponApi, deleteCouponApi } from "@/lib/api"
import Loading from "@/components/Loading"

export default function AdminCoupons() {
    const queryClient = useQueryClient()

    const [newCoupon, setNewCoupon] = useState({
        code: '',
        description: '',
        discount: '',
        forNewUser: false,
        forMember: false,
        isPublic: true,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days default
    })

    const { data: coupons = [], isLoading, error } = useQuery({
        queryKey: ['admin-coupons'],
        queryFn: fetchCoupons,
    })

    const createMutation = useMutation({
        mutationFn: createCouponApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
            toast.success("Coupon created successfully!")
            setNewCoupon({
                code: '',
                description: '',
                discount: '',
                forNewUser: false,
                forMember: false,
                isPublic: true,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
            })
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to create coupon')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: deleteCouponApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-coupons'] })
            toast.success("Coupon deleted")
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to delete coupon')
        }
    })

    const handleAddCoupon = async (e) => {
        e.preventDefault()
        if (!newCoupon.code.trim()) return toast.error('Code is required')
        if (!newCoupon.discount) return toast.error('Discount is required')

        createMutation.mutate({
            code: newCoupon.code.trim().toUpperCase(),
            description: newCoupon.description.trim(),
            discount: parseFloat(newCoupon.discount),
            forNewUser: newCoupon.forNewUser,
            forMember: newCoupon.forMember,
            isPublic: newCoupon.isPublic,
            expiresAt: newCoupon.expiresAt.toISOString(),
        })
    }

    const handleChange = (e) => {
        setNewCoupon({ ...newCoupon, [e.target.name]: e.target.value })
    }

    if (isLoading) return <Loading />

    return (
        <div className="text-slate-500 mb-40">
            <h1 className="text-2xl">Manage <span className="text-slate-800 font-medium">Coupons</span></h1>
            <p className="text-xs text-slate-400 mt-1">Create and distribute promotional discounts across the store</p>

            {/* Add Coupon */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6 mt-6 max-w-lg shadow-xs">
                <form onSubmit={handleAddCoupon} className="text-sm">
                    <h2 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                        <Plus size={18} className="text-indigo-600" /> Add New Coupon
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
                        <div>
                            <label className="text-xs font-semibold text-slate-600">Coupon Code</label>
                            <input 
                                type="text" 
                                placeholder="e.g. FLASH25" 
                                className="w-full mt-1 p-2.5 border border-slate-200 focus:border-indigo-500 rounded-lg uppercase text-xs outline-none"
                                name="code" 
                                value={newCoupon.code} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                        <div>
                            <label className="text-xs font-semibold text-slate-600">Discount (%)</label>
                            <input 
                                type="number" 
                                placeholder="e.g. 25" 
                                min={1} 
                                max={100} 
                                className="w-full mt-1 p-2.5 border border-slate-200 focus:border-indigo-500 rounded-lg text-xs outline-none"
                                name="discount" 
                                value={newCoupon.discount} 
                                onChange={handleChange} 
                                required
                            />
                        </div>
                    </div>

                    <div className="mt-3">
                        <label className="text-xs font-semibold text-slate-600">Description</label>
                        <input 
                            type="text" 
                            placeholder="e.g. 25% off storewide flash sale" 
                            className="w-full mt-1 p-2.5 border border-slate-200 focus:border-indigo-500 rounded-lg text-xs outline-none"
                            name="description" 
                            value={newCoupon.description} 
                            onChange={handleChange} 
                            required
                        />
                    </div>

                    <div className="mt-3">
                        <label className="text-xs font-semibold text-slate-600">Expiry Date</label>
                        <input 
                            type="date" 
                            className="w-full mt-1 p-2.5 border border-slate-200 focus:border-indigo-500 rounded-lg text-xs outline-none"
                            name="expiresAt" 
                            value={format(newCoupon.expiresAt, 'yyyy-MM-dd')} 
                            onChange={(e) => setNewCoupon({ ...newCoupon, expiresAt: new Date(e.target.value) })}
                            required
                        />
                    </div>

                    <div className="flex flex-wrap gap-5 mt-4 pt-3 border-t border-slate-100">
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                            <input 
                                type="checkbox" 
                                name="isPublic" 
                                checked={newCoupon.isPublic}
                                onChange={(e) => setNewCoupon({ ...newCoupon, isPublic: e.target.checked })}
                                className="accent-indigo-600 size-4"
                            />
                            Public coupon
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
                            <input 
                                type="checkbox" 
                                name="forNewUser" 
                                checked={newCoupon.forNewUser}
                                onChange={(e) => setNewCoupon({ ...newCoupon, forNewUser: e.target.checked })}
                                className="accent-indigo-600 size-4"
                            />
                            New users only
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={createMutation.isPending}
                        className="mt-5 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs active:scale-95 transition cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                    >
                        {createMutation.isPending ? (
                            <>
                                <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                Creating Coupon...
                            </>
                        ) : (
                            "Create Coupon"
                        )}
                    </button>
                </form>
            </div>

            {/* List Coupons */}
            <div className="mt-12">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <Ticket size={20} className="text-indigo-600" /> Active Coupons ({coupons.length})
                </h2>

                {coupons.length === 0 ? (
                    <p className="text-xs text-slate-400 mt-2">No coupons created yet. Use form above to add discount promotions.</p>
                ) : (
                    <div className="overflow-x-auto mt-4 rounded-xl border border-slate-200 max-w-4xl bg-white shadow-2xs">
                        <table className="min-w-full text-sm">
                            <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold">Code</th>
                                    <th className="py-3 px-4 text-left font-semibold">Description</th>
                                    <th className="py-3 px-4 text-left font-semibold">Discount</th>
                                    <th className="py-3 px-4 text-left font-semibold">Expires</th>
                                    <th className="py-3 px-4 text-left font-semibold">Audience</th>
                                    <th className="py-3 px-4 text-center font-semibold">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.code} className="hover:bg-slate-50/80 transition">
                                        <td className="py-3 px-4 font-bold text-indigo-600">{coupon.code}</td>
                                        <td className="py-3 px-4 text-slate-700 text-xs">{coupon.description}</td>
                                        <td className="py-3 px-4 font-semibold text-emerald-600">{coupon.discount}% OFF</td>
                                        <td className="py-3 px-4 text-slate-500 text-xs">{format(new Date(coupon.expiresAt), 'MMM dd, yyyy')}</td>
                                        <td className="py-3 px-4 text-xs">
                                            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                                                {coupon.forNewUser ? 'New Users' : 'All Users'}
                                            </span>
                                        </td>
                                        <td className="py-3 px-4 text-center">
                                            <button 
                                                onClick={() => deleteMutation.mutate(coupon.code)}
                                                disabled={deleteMutation.isPending}
                                                className="p-1.5 rounded-full text-slate-400 hover:text-red-600 hover:bg-red-50 transition cursor-pointer"
                                                title="Delete coupon"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    )
}