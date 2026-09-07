'use client'
import Image from "next/image";
import { DotIcon } from "lucide-react";
import { useSelector } from "react-redux";
import Rating from "./Rating";
import { useState } from "react";
import RatingModal from "./RatingModal";

const OrderItem = ({ order }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु';
    const [ratingModal, setRatingModal] = useState(null);

    const { ratings } = useSelector(state => state.rating);

    return (
        <>
            <tr className="text-sm">
                <td className="text-left">
                    <div className="flex flex-col gap-6">
                        {order.orderItems.map((item, index) => {
                            const product = item.listing || item.product || {};
                            const prodId = product.id || item.listingId;
                            const hasRating = ratings.find(r => order.id === r.orderId && prodId === (r.listingId || r.productId));

                            return (
                                <div key={index} className="flex items-center gap-4">
                                    <div className="size-20 aspect-square bg-slate-100 flex items-center justify-center rounded-xl overflow-hidden border border-slate-200/80 relative shrink-0">
                                        <Image
                                            className="object-contain p-1.5"
                                            src={product.images?.[0] || '/placeholder.png'}
                                            alt={product.name || "Item"}
                                            fill
                                            sizes="80px"
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center text-sm">
                                        <p className="font-semibold text-slate-800 text-base">{product.name || 'Order Item'}</p>
                                        <p className="text-slate-500 text-xs mt-0.5">{currency}{item.price.toLocaleString()} × Qty: {item.quantity}</p>
                                        <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                                        <div className="mt-1">
                                            {hasRating ? (
                                                <Rating value={hasRating.rating} />
                                            ) : (
                                                <button 
                                                    type="button"
                                                    onClick={() => setRatingModal({ orderId: order.id, productId: prodId })} 
                                                    className="text-indigo-600 text-xs font-medium hover:underline transition cursor-pointer"
                                                >
                                                    Rate Item ★
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </td>

                <td className="text-center max-md:hidden font-medium text-slate-800">{currency}{order.total.toLocaleString()}</td>

                <td className="text-left max-md:hidden text-xs text-slate-600">
                    <p>{order.address?.name}, {order.address?.street},</p>
                    <p>{order.address?.city}, {order.address?.state}, {order.address?.zip}, {order.address?.country}</p>
                    <p className="text-slate-400 mt-1">{order.address?.phone}</p>
                </td>

                <td className="text-left space-y-2 text-sm max-md:hidden">
                    <div
                        className={`flex items-center justify-center gap-1 rounded-full p-1 text-xs font-medium ${order.status === 'confirmed'
                            ? 'text-yellow-600 bg-yellow-100'
                            : order.status === 'DELIVERED' || order.status === 'delivered'
                                ? 'text-green-600 bg-green-100'
                                : 'text-slate-600 bg-slate-100'
                            }`}
                    >
                        <DotIcon size={10} className="scale-250" />
                        {order.status.split('_').join(' ').toLowerCase()}
                    </div>
                </td>
            </tr>
            {/* Mobile */}
            <tr className="md:hidden">
                <td colSpan={5} className="text-xs text-slate-500 pb-4">
                    <p>{order.address?.name}, {order.address?.street}, {order.address?.city}</p>
                    <div className="flex items-center mt-2">
                        <span className='px-4 py-1 rounded bg-green-100 text-green-700 font-medium' >
                            {order.status.replace(/_/g, ' ').toLowerCase()}
                        </span>
                    </div>
                </td>
            </tr>
            <tr>
                <td colSpan={4}>
                    <div className="border-b border-slate-200 w-full mx-auto" />
                </td>
            </tr>
        </>
    )
}

export default OrderItem