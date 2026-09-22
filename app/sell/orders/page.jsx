'use client'
import { useState } from "react"
import Loading from "@/components/Loading"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchSellerOrders, updateSellerOrderStatus, deleteSellerOrder } from "@/lib/api"
import { useUser } from "@clerk/nextjs"
import toast from "react-hot-toast"
import Image from "next/image"
import { Trash2 } from "lucide-react"

export default function SellerOrders() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'
    const { user } = useUser()
    const queryClient = useQueryClient()

    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const { data: orders = [], isLoading } = useQuery({
        queryKey: ['seller-orders'],
        queryFn: fetchSellerOrders,
        enabled: Boolean(user),
    })

    const statusMutation = useMutation({
        mutationFn: updateSellerOrderStatus,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] })
            toast.success('Order status updated!')
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update order status')
        }
    })

    const deleteMutation = useMutation({
        mutationFn: deleteSellerOrder,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-orders'] })
            toast.success('Order deleted successfully!')
            closeModal()
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to delete order')
        }
    })

    const handleUpdateStatus = (orderId, status) => {
        statusMutation.mutate({ orderId, status })
    }

    const handleDeleteOrder = (orderId, orderNum) => {
        if (window.confirm(`Are you sure you want to delete order #${orderNum}? This action cannot be undone.`)) {
            deleteMutation.mutate(orderId)
        }
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    if (isLoading) return <Loading />

    return (
        <div className="mb-28">
            <h1 className="text-2xl text-slate-500 mb-5">Sales & <span className="text-slate-800 font-medium">Orders</span></h1>
            {orders.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-xl border border-slate-200">
                    <p className="text-slate-600 font-medium">No sales orders yet</p>
                    <p className="text-xs text-slate-400 mt-1">When buyers order your items, they will appear here for fulfillment.</p>
                </div>
            ) : (
                <div className="overflow-x-auto max-w-5xl rounded-xl border border-slate-200 bg-white shadow-2xs">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                {["No.", "Buyer", "Amount", "Payment", "Status", "Date", "Action"].map((heading, i) => (
                                    <th key={i} className={`px-4 py-3 ${heading === 'Action' ? 'text-center' : ''}`}>{heading}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order, index) => (
                                <tr
                                    key={order.id}
                                    className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                                    onClick={() => openModal(order)}
                                >
                                    <td className="px-4 py-3 font-semibold text-indigo-600">
                                        #{index + 1}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{order.user?.name || 'Buyer'}</td>
                                    <td className="px-4 py-3 font-semibold text-slate-800">{currency}{order.total.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-xs">{order.paymentMethod}</td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <div className="inline-flex items-center gap-1.5">
                                            <select
                                                value={order.status}
                                                onChange={e => handleUpdateStatus(order.id, e.target.value)}
                                                disabled={statusMutation.isPending && statusMutation.variables?.orderId === order.id}
                                                className={`border rounded-lg text-xs p-1.5 outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer font-medium ${
                                                    order.status === 'DELIVERED'
                                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                                        : order.status === 'SHIPPED'
                                                        ? 'bg-blue-50 text-blue-800 border-blue-300'
                                                        : order.status === 'PROCESSING'
                                                        ? 'bg-amber-50 text-amber-800 border-amber-300'
                                                        : 'bg-white text-slate-700 border-slate-200'
                                                }`}
                                            >
                                                <option value="ORDER_PLACED">ORDER_PLACED</option>
                                                <option value="PROCESSING">PROCESSING</option>
                                                <option value="SHIPPED">SHIPPED</option>
                                                <option value="DELIVERED">DELIVERED</option>
                                            </select>
                                            {statusMutation.isPending && statusMutation.variables?.orderId === order.id && (
                                                <span className="inline-block size-3.5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">
                                        {new Date(order.createdAt).toLocaleDateString()}
                                    </td>
                                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                                        <button
                                            type="button"
                                            onClick={() => handleDeleteOrder(order.id, index + 1)}
                                            disabled={deleteMutation.isPending && deleteMutation.variables === order.id}
                                            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                                                order.status === 'DELIVERED'
                                                    ? 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                                                    : 'text-slate-400 hover:text-red-600 hover:bg-red-50 border border-transparent'
                                            }`}
                                            title={order.status === 'DELIVERED' ? "Delete completed order" : "Delete order"}
                                        >
                                            {deleteMutation.isPending && deleteMutation.variables === order.id ? (
                                                <span className="inline-block size-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                                            ) : (
                                                <Trash2 size={14} />
                                            )}
                                            <span>Delete</span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {isModalOpen && selectedOrder && (
                <div onClick={closeModal} className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-xs text-slate-700 text-sm z-50 p-4" >
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-lg font-bold text-slate-900">
                                Order Details
                            </h2>
                            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                                selectedOrder.status === 'DELIVERED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-indigo-100 text-indigo-800'
                            }`}>
                                {selectedOrder.status}
                            </span>
                        </div>

                        {/* Customer Details */}
                        <div className="mb-4 text-xs space-y-1 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
                            <h3 className="font-semibold text-sm text-slate-800 mb-2">Buyer Information</h3>
                            <p><span className="text-slate-500">Name:</span> {selectedOrder.user?.name}</p>
                            <p><span className="text-slate-500">Email:</span> {selectedOrder.user?.email}</p>
                            <p><span className="text-slate-500">Phone:</span> {selectedOrder.address?.phone}</p>
                            <p><span className="text-slate-500">Delivery Address:</span> {`${selectedOrder.address?.street}, ${selectedOrder.address?.city}, ${selectedOrder.address?.country}`}</p>
                        </div>

                        {/* Products */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-sm text-slate-800 mb-2">Items to Fulfill</h3>
                            <div className="space-y-2">
                                {selectedOrder.orderItems.map((item, i) => {
                                    const product = item.listing || item.product || {};
                                    return (
                                        <div key={i} className="flex items-center gap-3 border border-slate-200/80 rounded-xl p-2.5 bg-white">
                                            <div className="size-12 rounded-lg bg-slate-100 relative overflow-hidden shrink-0">
                                                <Image
                                                    src={product.images?.[0] || '/placeholder.png'}
                                                    alt={product.name || 'Item'}
                                                    fill
                                                    sizes="48px"
                                                    className="object-contain p-1"
                                                />
                                            </div>
                                            <div className="flex-1 text-xs">
                                                <p className="font-semibold text-slate-800">{product.name || 'Listing Item'}</p>
                                                <p className="text-slate-400 mt-0.5">Qty: {item.quantity} · {currency}{item.price.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                            <div>
                                <p className="text-xs text-slate-400">Total Amount</p>
                                <p className="text-base font-bold text-indigo-600">{currency}{selectedOrder.total.toLocaleString()}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDeleteOrder(selectedOrder.id, '')}
                                    disabled={deleteMutation.isPending}
                                    className="px-3.5 py-2 bg-red-50 text-xs font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-100 cursor-pointer transition flex items-center gap-1.5"
                                >
                                    {deleteMutation.isPending ? (
                                        <span className="inline-block size-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></span>
                                    ) : (
                                        <Trash2 size={14} />
                                    )}
                                    Delete Order
                                </button>
                                <button onClick={closeModal} className="px-4 py-2 bg-slate-100 text-xs font-semibold text-slate-700 rounded-lg hover:bg-slate-200 cursor-pointer transition" >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
