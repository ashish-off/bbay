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
                        {order.orderItems.map((item, index) => (
                            <div key={index} className="flex items-center gap-4">
                                <div className="w-20 aspect-square bg-slate-100 flex items-center justify-center rounded-md">
                                    <Image
                                        className="h-14 w-auto"
                                        src={item.product?.images?.[0] || ''}
                                        alt="product_img"
                                        width={50}
                                        height={50}
                                    />
                                </div>
                                <div className="flex flex-col justify-center text-sm">
                                    <p className="font-medium text-slate-700 text-base">{item.product?.name}</p>
                                    <p>{currency}{item.price.toLocaleString()} Qty : {item.quantity} </p>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(order.createdAt).toDateString()}</p>
                                    <div>
                                        {ratings.find(rating => order.id === rating.orderId && item.product?.id === rating.productId)
                                            ? <Rating value={ratings.find(rating => order.id === rating.orderId && item.product?.id === rating.productId).rating} />
                                            : <button onClick={() => setRatingModal({ orderId: order.id, productId: item.product?.id })} className={`text-indigo-600 text-xs mt-1 hover:underline transition ${order.status !== "DELIVERED" && 'hidden'}`}>Rate Item</button>
                                        }</div>
                                    {ratingModal && <RatingModal ratingModal={ratingModal} setRatingModal={setRatingModal} />}
                                </div>
                            </div>
                        ))}
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