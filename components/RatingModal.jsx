'use client'
import { Star, XIcon } from 'lucide-react';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createRatingApi } from '@/lib/api';

const RatingModal = ({ ratingModal, setRatingModal }) => {
    const [rating, setRating] = useState(5);
    const [review, setReview] = useState('');
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: createRatingApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['listings'] });
            toast.success('Thank you! Review submitted successfully');
            setRatingModal(null);
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to submit review');
        }
    });

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (rating < 1 || rating > 5) {
            return toast.error('Please select a star rating (1-5)');
        }
        if (!review.trim()) {
            return toast.error('Please write a short review description');
        }

        mutation.mutate({
            listingId: ratingModal.productId,
            orderId: ratingModal.orderId,
            rating,
            review: review.trim(),
        });
    };

    return (
        <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4'>
            <div className='bg-white p-7 rounded-2xl shadow-2xl w-full max-w-sm relative animate-in fade-in zoom-in-95 duration-200'>
                <button 
                    onClick={() => setRatingModal(null)} 
                    className='absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition cursor-pointer'
                >
                    <XIcon size={20} />
                </button>
                <h2 className='text-lg font-bold text-slate-800 mb-1'>Rate Your Purchase</h2>
                <p className='text-xs text-slate-400 mb-5'>Share feedback about the item condition and seller</p>

                <div className='flex items-center justify-center gap-1.5 mb-5'>
                    {Array.from({ length: 5 }, (_, i) => (
                        <Star
                            key={i}
                            className={`size-8 cursor-pointer transition-transform hover:scale-110 ${rating > i ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                            onClick={() => setRating(i + 1)}
                        />
                    ))}
                </div>

                <textarea
                    className='w-full p-3 border border-slate-200 rounded-xl mb-4 focus:outline-none focus:border-indigo-500 text-sm resize-none'
                    placeholder='Describe the product quality, shipping, or accuracy...'
                    rows={4}
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                />

                <button 
                    onClick={handleSubmit} 
                    disabled={mutation.isPending}
                    className='w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white font-semibold py-2.5 rounded-xl transition cursor-pointer text-sm flex items-center justify-center gap-2'
                >
                    {mutation.isPending ? (
                        <>
                            <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Submitting Review...
                        </>
                    ) : (
                        "Submit Review"
                    )}
                </button>
            </div>
        </div>
    );
};

export default RatingModal;