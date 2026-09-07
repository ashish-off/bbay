'use client'
import { addToCart, removeFromCart } from "@/lib/features/cart/cartSlice";
import { useDispatch, useSelector } from "react-redux";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCartQtyApi } from "@/lib/api";

const Counter = ({ productId, quantity: propQty, onUpdate }) => {
    const { cartItems } = useSelector(state => state.cart);
    const dispatch = useDispatch();
    const queryClient = useQueryClient();

    const currentQty = propQty !== undefined ? propQty : (cartItems[productId] || 1);

    const mutation = useMutation({
        mutationFn: updateCartQtyApi,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['cart'] });
        },
    });

    const handleIncrement = () => {
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
                className="px-1 text-base font-bold select-none hover:text-indigo-600 active:scale-90 transition cursor-pointer"
            >
                +
            </button>
        </div>
    );
};

export default Counter;