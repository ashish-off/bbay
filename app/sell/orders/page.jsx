'use client'
import { useEffect, useState } from "react"
import Loading from "@/components/Loading"
import { orderDummyData } from "@/assets/assets"

export default function SellerOrders() {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedOrder, setSelectedOrder] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const fetchOrders = async () => {
       setOrders(orderDummyData)
       setLoading(false)
    }

    const updateOrderStatus = async (orderId, status) => {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status } : o))
    }

    const openModal = (order) => {
        setSelectedOrder(order)
        setIsModalOpen(true)
    }

    const closeModal = () => {
        setSelectedOrder(null)
        setIsModalOpen(false)
    }

    useEffect(() => {
        fetchOrders()
    }, [])

    if (loading) return <Loading />

    return (
        <div className="mb-28">
            <h1 className="text-2xl text-slate-500 mb-5">Sales & <span className="text-slate-800 font-medium">Orders</span></h1>
            {orders.length === 0 ? (
                <p className="text-slate-400">No orders received yet.</p>
            ) : (
                <div className="overflow-x-auto max-w-5xl rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-sm text-left text-slate-600">
                        <thead className="bg-slate-50 text-slate-700 text-xs uppercase tracking-wider border-b border-slate-200">
                            <tr>
                                {["No.", "Buyer", "Amount", "Payment", "Status", "Date"].map((heading, i) => (
                                    <th key={i} className="px-4 py-3">{heading}</th>
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
                                    <td className="px-4 py-3 font-medium text-indigo-600">
                                        {index + 1}
                                    </td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{order.user?.name}</td>
                                    <td className="px-4 py-3 font-medium text-slate-800">{currency}{order.total.toLocaleString()}</td>
                                    <td className="px-4 py-3 text-xs">{order.paymentMethod}</td>
                                    <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                                        <select
                                            value={order.status}
                                            onChange={e => updateOrderStatus(order.id, e.target.value)}
                                            className="border border-slate-200 rounded-md text-xs p-1 outline-none focus:ring-1 focus:ring-indigo-300"
                                        >
                                            <option value="ORDER_PLACED">ORDER_PLACED</option>
                                            <option value="PROCESSING">PROCESSING</option>
                                            <option value="SHIPPED">SHIPPED</option>
                                            <option value="DELIVERED">DELIVERED</option>
                                        </select>
                                    </td>
                                    <td className="px-4 py-3 text-slate-400 text-xs">
                                        {new Date(order.createdAt).toLocaleDateString()}
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
                    <div onClick={e => e.stopPropagation()} className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative">
                        <h2 className="text-lg font-semibold text-slate-900 mb-4">
                            Order Details
                        </h2>

                        {/* Customer Details */}
                        <div className="mb-4 text-xs space-y-1">
                            <h3 className="font-semibold text-sm text-slate-800 mb-2">Buyer Information</h3>
                            <p><span className="text-slate-500">Name:</span> {selectedOrder.user?.name}</p>
                            <p><span className="text-slate-500">Phone:</span> {selectedOrder.address?.phone}</p>
                            <p><span className="text-slate-500">Address:</span> {`${selectedOrder.address?.street}, ${selectedOrder.address?.city}, ${selectedOrder.address?.country}`}</p>
                        </div>

                        {/* Products */}
                        <div className="mb-4">
                            <h3 className="font-semibold text-sm text-slate-800 mb-2">Items</h3>
                            <div className="space-y-2">
                                {selectedOrder.orderItems.map((item, i) => (
                                    <div key={i} className="flex items-center gap-3 border border-slate-100 rounded-lg p-2 bg-slate-50/50">
                                        <img
                                            src={item.product?.images?.[0]?.src || item.product?.images?.[0] || ''}
                                            alt={item.product?.name}
                                            className="w-12 h-12 object-cover rounded"
                                        />
                                        <div className="flex-1 text-xs">
                                            <p className="font-medium text-slate-800">{item.product?.name}</p>
                                            <p className="text-slate-400">Qty: {item.quantity} · {currency}{item.price.toLocaleString()}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                            <div>
                                <p className="text-xs text-slate-400">Total Amount</p>
                                <p className="text-base font-bold text-slate-800">{currency}{selectedOrder.total.toLocaleString()}</p>
                            </div>
                            <button onClick={closeModal} className="px-4 py-1.5 bg-slate-100 text-xs font-medium text-slate-600 rounded-lg hover:bg-slate-200" >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
