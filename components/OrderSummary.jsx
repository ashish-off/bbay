import { PlusIcon, SquarePenIcon, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

const OrderSummary = ({ totalPrice, items }) => {

    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु';

    const router = useRouter();

    const addressList = useSelector(state => state.address.list);

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState('');

    const handleCouponCode = async (event) => {
        event.preventDefault();
        if (couponCodeInput.toUpperCase() === 'NEW20') {
            setCoupon({ code: 'NEW20', discount: 20, description: '20% off for new user' })
            toast.success('Coupon Applied!')
        } else {
            toast.error('Invalid coupon code')
        }
    }

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (!selectedAddress && addressList.length === 0) {
            return toast.error('Please add a delivery address first');
        }
        router.push('/orders')
    }

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-slate-50/30 border border-slate-200 text-slate-500 text-sm rounded-xl p-7'>
            <h2 className='text-xl font-medium text-slate-600'>Payment Summary</h2>
            <p className='text-slate-400 text-xs my-4'>Payment Method</p>
            <div className='flex gap-2 items-center'>
                <input type="radio" id="COD" name='payment' onChange={() => setPaymentMethod('COD')} checked={paymentMethod === 'COD'} className='accent-indigo-600' />
                <label htmlFor="COD" className='cursor-pointer'>Cash on Delivery (COD)</label>
            </div>
            <div className='flex gap-2 items-center mt-2'>
                <input type="radio" id="ESEWA" name='payment' onChange={() => setPaymentMethod('ESEWA')} checked={paymentMethod === 'ESEWA'} className='accent-indigo-600' />
                <label htmlFor="ESEWA" className='cursor-pointer font-medium text-green-700'>eSewa / Khalti</label>
            </div>
            <div className='my-4 py-4 border-y border-slate-200 text-slate-400'>
                <p>Delivery Address</p>
                {
                    selectedAddress ? (
                        <div className='flex gap-2 items-center mt-2 text-slate-700'>
                            <p className='text-xs'>{selectedAddress.name}, {selectedAddress.street}, {selectedAddress.city}</p>
                            <SquarePenIcon onClick={() => setSelectedAddress(null)} className='cursor-pointer text-slate-400 hover:text-slate-600' size={16} />
                        </div>
                    ) : (
                        <div>
                            {
                                addressList.length > 0 && (
                                    <select className='border border-slate-300 p-2 w-full my-3 outline-none rounded text-xs text-slate-600' onChange={(e) => setSelectedAddress(addressList[e.target.value])} >
                                        <option value="">Select Address</option>
                                        {
                                            addressList.map((address, index) => (
                                                <option key={index} value={index}>{address.name}, {address.city}, {address.street}</option>
                                            ))
                                        }
                                    </select>
                                )
                            }
                            <button className='flex items-center gap-1 text-indigo-600 font-medium mt-1 text-xs' onClick={() => setShowAddressModal(true)} >Add Address <PlusIcon size={14} /></button>
                        </div>
                    )
                }
            </div>
            <div className='pb-4 border-b border-slate-200'>
                <div className='flex justify-between'>
                    <div className='flex flex-col gap-1 text-slate-400'>
                        <p>Subtotal:</p>
                        <p>Shipping:</p>
                        {coupon && <p>Coupon:</p>}
                    </div>
                    <div className='flex flex-col gap-1 font-medium text-right'>
                        <p>{currency}{totalPrice.toLocaleString()}</p>
                        <p className='text-green-600'>Free</p>
                        {coupon && <p className='text-red-500'>{`-${currency}${(coupon.discount / 100 * totalPrice).toFixed(0)}`}</p>}
                    </div>
                </div>
                {
                    !coupon ? (
                        <form onSubmit={e => toast.promise(handleCouponCode(e), { loading: 'Checking Coupon...' })} className='flex justify-center gap-2 mt-3'>
                            <input onChange={(e) => setCouponCodeInput(e.target.value)} value={couponCodeInput} type="text" placeholder='Coupon Code' className='border border-slate-300 p-1.5 rounded w-full outline-none text-xs' />
                            <button className='bg-slate-700 text-white px-3 rounded hover:bg-slate-800 text-xs active:scale-95 transition-all'>Apply</button>
                        </form>
                    ) : (
                        <div className='w-full flex items-center justify-between text-xs mt-2 bg-green-50 text-green-700 p-1.5 rounded border border-green-200'>
                            <p>Code: <span className='font-semibold'>{coupon.code.toUpperCase()}</span> ({coupon.discount}%)</p>
                            <XIcon size={16} onClick={() => setCoupon('')} className='hover:text-red-700 transition cursor-pointer' />
                        </div>
                    )
                }
            </div>
            <div className='flex justify-between py-4 text-base'>
                <p className='font-semibold text-slate-700'>Total:</p>
                <p className='font-bold text-right text-slate-800'>{currency}{coupon ? (totalPrice - (coupon.discount / 100 * totalPrice)).toFixed(0) : totalPrice.toLocaleString()}</p>
            </div>
            <button onClick={e => toast.promise(handlePlaceOrder(e), { loading: 'Placing Order...' })} className='w-full bg-indigo-600 text-white py-2.5 rounded hover:bg-indigo-700 active:scale-95 transition-all font-medium'>Place Order</button>

            {showAddressModal && <AddressModal setShowAddressModal={setShowAddressModal} />}

        </div>
    )
}

export default OrderSummary