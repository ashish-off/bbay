'use client'
import { PlusIcon, SquarePenIcon, XIcon, CheckCircle2 } from 'lucide-react';
import React, { useState } from 'react'
import AddressModal from './AddressModal';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAddresses, validateCouponApi, createOrderApi, initiateEsewaPayment } from '@/lib/api';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';

const OrderSummary = ({ totalPrice, items }) => {
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु';
    const router = useRouter();
    const { user } = useUser();
    const { openSignIn } = useClerk();
    const queryClient = useQueryClient();

    const [paymentMethod, setPaymentMethod] = useState('COD');
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const [couponCodeInput, setCouponCodeInput] = useState('');
    const [coupon, setCoupon] = useState(null);
    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

    const { data: addresses = [] } = useQuery({
        queryKey: ['addresses'],
        queryFn: fetchAddresses,
        enabled: Boolean(user),
    });

    // Auto-select first address if none chosen
    const activeAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0] || null;

    const orderMutation = useMutation({
        mutationFn: createOrderApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            toast.success('Order placed successfully!');
            router.push('/orders');
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to place order');
        }
    });

    const handleCouponCode = async (event) => {
        event.preventDefault();
        const code = couponCodeInput.trim().toUpperCase();
        if (!code) return;

        setIsCheckingCoupon(true);
        try {
            const res = await validateCouponApi(code);
            setCoupon(res);
            toast.success(`Coupon ${res.code} applied! (${res.discount}% off)`);
            setCouponCodeInput('');
        } catch (err) {
            toast.error(err.message || 'Invalid coupon code');
        } finally {
            setIsCheckingCoupon(false);
        }
    };

    const [isEsewaProcessing, setIsEsewaProcessing] = useState(false);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();

        if (!user) {
            toast.error('Please sign in to place an order');
            openSignIn();
            return;
        }

        if (!activeAddress) {
            toast.error('Please select or add a delivery address first');
            setShowAddressModal(true);
            return;
        }

        if (paymentMethod === 'ESEWA') {
            // eSewa flow: initiate payment → redirect to eSewa
            setIsEsewaProcessing(true);
            try {
                const res = await initiateEsewaPayment({
                    addressId: activeAddress.id,
                    couponCode: coupon?.code || null,
                });

                // Create hidden form and auto-submit to eSewa
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = res.paymentUrl;
                Object.entries(res.formData).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });
                document.body.appendChild(form);
                form.submit();
            } catch (err) {
                toast.error(err.message || 'Failed to initiate eSewa payment');
                setIsEsewaProcessing(false);
            }
        } else {
            // COD flow: place order directly
            orderMutation.mutate({
                addressId: activeAddress.id,
                paymentMethod,
                couponCode: coupon?.code || null,
            });
        }
    };

    const discountAmount = coupon ? Math.round((coupon.discount / 100) * totalPrice) : 0;
    const finalTotal = Math.max(0, totalPrice - discountAmount);

    return (
        <div className='w-full max-w-lg lg:max-w-[340px] bg-white border border-slate-200 text-slate-500 text-sm rounded-2xl p-6 shadow-xs'>
            <h2 className='text-lg font-bold text-slate-800'>Payment Summary</h2>
            
            <p className='text-slate-400 text-xs mt-4 mb-2 uppercase tracking-wider font-semibold'>Payment Method</p>
            <div className='space-y-2'>
                <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition ${paymentMethod === 'COD' ? 'border-indigo-600 bg-indigo-50/40 text-slate-800' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input 
                        type="radio" 
                        id="COD" 
                        name='payment' 
                        onChange={() => setPaymentMethod('COD')} 
                        checked={paymentMethod === 'COD'} 
                        className='accent-indigo-600' 
                    />
                    <span className='text-xs font-medium'>Cash on Delivery (COD)</span>
                </label>
                <label className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition ${paymentMethod === 'ESEWA' ? 'border-green-600 bg-green-50/40 text-green-900' : 'border-slate-200 hover:border-slate-300'}`}>
                    <input 
                        type="radio" 
                        id="ESEWA" 
                        name='payment' 
                        onChange={() => setPaymentMethod('ESEWA')} 
                        checked={paymentMethod === 'ESEWA'} 
                        className='accent-green-600' 
                    />
                    <span className='text-xs font-semibold text-green-700'>eSewa</span>
                </label>
                <label className='flex items-center gap-3 p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 cursor-not-allowed opacity-50'>
                    <input 
                        type="radio" 
                        id="KHALTI" 
                        name='payment' 
                        disabled
                        className='accent-purple-600' 
                    />
                    <span className='text-xs font-medium text-slate-400'>Khalti</span>
                    <span className='ml-auto text-[10px] font-semibold bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full'>Coming Soon</span>
                </label>
            </div>

            {/* Delivery Address Section */}
            <div className='my-4 py-4 border-y border-slate-200 text-slate-600'>
                <div className="flex items-center justify-between mb-2">
                    <p className='text-xs text-slate-400 uppercase tracking-wider font-semibold'>Delivery Address</p>
                    {addresses.length > 0 && (
                        <button 
                            type="button" 
                            onClick={() => setShowAddressModal(true)} 
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-0.5"
                        >
                            <PlusIcon size={13} /> Add
                        </button>
                    )}
                </div>

                {activeAddress ? (
                    <div className='bg-slate-50 p-3 rounded-xl border border-slate-200/80'>
                        <div className="flex items-start justify-between">
                            <div>
                                <p className='text-xs font-semibold text-slate-800'>{activeAddress.name}</p>
                                <p className='text-xs text-slate-500 mt-0.5'>{activeAddress.street}, {activeAddress.city}</p>
                                <p className='text-[11px] text-slate-400'>{activeAddress.phone}</p>
                            </div>
                        </div>

                        {addresses.length > 1 && (
                            <select 
                                className='border border-slate-200 bg-white p-1.5 w-full mt-2.5 outline-none rounded-md text-xs text-slate-700' 
                                value={activeAddress.id}
                                onChange={(e) => setSelectedAddressId(e.target.value)}
                            >
                                {addresses.map((addr) => (
                                    <option key={addr.id} value={addr.id}>
                                        {addr.name} — {addr.city} ({addr.street})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                        <p className="text-xs text-slate-400 mb-2">No delivery address saved</p>
                        <button 
                            type="button" 
                            className='inline-flex items-center gap-1 bg-indigo-600 text-white text-xs font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-700 transition cursor-pointer' 
                            onClick={() => setShowAddressModal(true)}
                        >
                            Add Address <PlusIcon size={13} />
                        </button>
                    </div>
                )}
            </div>

            {/* Price Calculations & Coupon */}
            <div className='pb-4 border-b border-slate-200 space-y-2'>
                <div className='flex justify-between text-xs'>
                    <span className='text-slate-500'>Subtotal</span>
                    <span className='font-semibold text-slate-800'>{currency}{totalPrice.toLocaleString()}</span>
                </div>
                <div className='flex justify-between text-xs'>
                    <span className='text-slate-500'>Delivery Fee</span>
                    <span className='font-semibold text-emerald-600'>Free</span>
                </div>
                {coupon && (
                    <div className='flex justify-between text-xs text-emerald-600'>
                        <span>Discount ({coupon.discount}%)</span>
                        <span className='font-semibold'>-{currency}{discountAmount.toLocaleString()}</span>
                    </div>
                )}

                {/* Coupon Input or Active Coupon Chip */}
                {!coupon ? (
                    <form onSubmit={handleCouponCode} className='flex gap-2 pt-2'>
                        <input 
                            onChange={(e) => setCouponCodeInput(e.target.value)} 
                            value={couponCodeInput} 
                            type="text" 
                            placeholder='Coupon code' 
                            className='border border-slate-200 p-2 rounded-lg w-full outline-none text-xs uppercase focus:border-indigo-500' 
                        />
                        <button 
                            type="submit" 
                            disabled={isCheckingCoupon || !couponCodeInput.trim()}
                            className='bg-slate-800 hover:bg-slate-900 disabled:bg-slate-300 text-white px-3.5 rounded-lg text-xs font-medium active:scale-95 transition cursor-pointer'
                        >
                            {isCheckingCoupon ? '...' : 'Apply'}
                        </button>
                    </form>
                ) : (
                    <div className='w-full flex items-center justify-between text-xs bg-emerald-50 text-emerald-700 p-2 rounded-lg border border-emerald-200 mt-2'>
                        <div className="flex items-center gap-1.5">
                            <CheckCircle2 size={14} />
                            <span>Code: <strong>{coupon.code}</strong> (-{coupon.discount}%)</span>
                        </div>
                        <button type="button" onClick={() => setCoupon(null)} className="hover:text-red-600 transition cursor-pointer">
                            <XIcon size={14} />
                        </button>
                    </div>
                )}
            </div>

            <div className='flex justify-between py-4 text-base'>
                <p className='font-semibold text-slate-700'>Total:</p>
                <p className='font-bold text-right text-indigo-600 text-lg'>
                    {currency}{finalTotal.toLocaleString()}
                </p>
            </div>

            <button 
                type="button" 
                onClick={handlePlaceOrder} 
                disabled={orderMutation.isPending || isEsewaProcessing || items.length === 0}
                className={`w-full ${paymentMethod === 'ESEWA' ? 'bg-green-600 hover:bg-green-700 disabled:bg-green-300' : 'bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300'} text-white py-3 rounded-xl active:scale-95 transition font-semibold text-sm cursor-pointer shadow-xs flex items-center justify-center gap-2`}
            >
                {orderMutation.isPending || isEsewaProcessing ? (
                    <>
                        <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        {isEsewaProcessing ? 'Redirecting to eSewa...' : 'Processing Order...'}
                    </>
                ) : (
                    paymentMethod === 'ESEWA' ? 'Pay with eSewa' : 'Place Order'
                )}
            </button>

            {showAddressModal && (
                <AddressModal 
                    setShowAddressModal={setShowAddressModal} 
                    onAddressAdded={(newAddr) => setSelectedAddressId(newAddr.id)} 
                />
            )}
        </div>
    );
};

export default OrderSummary;