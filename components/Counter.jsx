'use client'
import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartQtyApi } from "@/lib/api";
import toast from "react-hot-toast";

const Counter = ({ productId, quantity: propQty, onUpdate, max }) => {
    const { cartItems } = useSelector(state => state.cart);
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const currentQty = propQty !== undefined ? propQty : (cartItems[productId] || 1);

    const mutation = useMutation({
        mutationFn: updateCartQtyApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
        onError: (err) => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
            toast.error(err.message || 'Failed to update quantity');
        },
    });

    const handleIncrement = () => {
        if (max !== undefined && max !== null && currentQty >= max) {
            toast.error(`Only ${max} item(s) available in stock`);
            return;
        }
        const nextQty = currentQty + 1;
        if (onUpdate) {
            onUpdate(nextQty);
        } else {
            dispatch(addToCart({ productId }));
            mutation.mutate({ listingId: productId, quantity: nextQty });
        }
    };

    const handleDecrement = () => {
        const nextQty = Math.max(1, currentQty - 1);
        if (onUpdate) {
            onUpdate(nextQty);
        } else {
            dispatch(removeFromCart({ productId }));
            mutation.mutate({ listingId: productId, quantity: nextQty });
        }
    };

    return (
        <div className="inline-flex items-center gap-1 sm:gap-3 px-3 py-1 rounded border border-slate-200 max-sm:text-sm text-slate-600 bg-white">
            <button 
                type="button" 
                onClick={handleDecrement} 
                className="px-1 text-base font-bold select-none hover:text-indigo-600 active:scale-90 transition cursor-pointer"
            >
                -
            </button>
            <p className="p-1 min-w-5 text-center font-medium text-slate-800">{currentQty}</p>
            <button 
                type="button" 
                onClick={handleIncrement} 
                disabled={max !== undefined && max !== null && currentQty >= max}
                className="px-1 text-base font-bold select-none hover:text-indigo-600 disabled:text-slate-300 disabled:cursor-not-allowed active:scale-90 transition cursor-pointer"
            >
                +
            </button>
        </div>
    );
};

export default Counter;