'use client'
import { XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createAddressApi } from "@/lib/api"
import { useUser } from "@clerk/nextjs"

const AddressModal = ({ setShowAddressModal, onAddressAdded }) => {
    const { user } = useUser()
    const queryClient = useQueryClient()

    const [address, setAddress] = useState({
        name: user?.fullName || '',
        email: user?.primaryEmailAddress?.emailAddress || '',
        street: '',
        city: 'Pokhara',
        state: 'Gandaki Province',
        zip: '',
        country: 'Nepal',
        phone: '+977-'
    })

    const mutation = useMutation({
        mutationFn: createAddressApi,
        onSuccess: (newAddress) => {
            queryClient.invalidateQueries({ queryKey: ['addresses'] })
            toast.success("Delivery address saved!")
            if (onAddressAdded) onAddressAdded(newAddress)
            setShowAddressModal(false)
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to save address')
        }
    })

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        mutation.mutate(address)
    }

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-slate-700 w-full max-w-md bg-white p-6 rounded-2xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                <button 
                    type="button" 
                    onClick={() => setShowAddressModal(false)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition"
                >
                    <XIcon size={20} />
                </button>
                
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Add Delivery <span className="text-indigo-600">Address</span></h2>
                    <p className="text-xs text-slate-400 mt-0.5">Enter shipping details for order fulfillment</p>
                </div>

                <div className="space-y-3 mt-2">
                    <input name="name" onChange={handleAddressChange} value={address.name} className="p-2.5 px-3 outline-none border border-slate-200 focus:border-indigo-500 rounded-lg w-full text-sm transition" type="text" placeholder="Full Name" required />
                    <input name="email" onChange={handleAddressChange} value={address.email} className="p-2.5 px-3 outline-none border border-slate-200 focus:border-indigo-500 rounded-lg w-full text-sm transition" type="email" placeholder="Email Address" required />
                    <input name="street" onChange={handleAddressChange} value={address.street} className="p-2.5 px-3 outline-none border border-slate-200 focus:border-indigo-500 rounded-lg w-full text-sm transition" type="text" placeholder="Street / Tole / Area (e.g., Lakeside Ward 6)" required />
                    <div className="grid grid-cols-2 gap-3">
                        <input name="city" onChange={handleAddressChange} value={address.city} className="p-2.5 px-3 outline-none border border-slate-200 focus:border-indigo-500 rounded-lg w-full text-sm transition" type="text" placeholder="City (Pokhara, KTM)" required />
                        <input name="state" onChange={handleAddressChange} value={address.state} className="p-2.5 px-3 outline-none border border-slate-200 focus:border-indigo-500 rounded-lg w-full text-sm transition" type="text" placeholder="Province" required />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <input name="zip" onChange={handleAddressChange} value={address.zip} className="p-2.5 px-3 outline-none border border-slate-200 focus:border-indigo-500 rounded-lg w-full text-sm transition" type="text" placeholder="Postal Code" required />
                        <input name="country" onChange={handleAddressChange} value={address.country} className="p-2.5 px-3 outline-none border border-slate-200 focus:border-indigo-500 rounded-lg w-full text-sm transition" type="text" placeholder="Country" required />
                    </div>
                    <input name="phone" onChange={handleAddressChange} value={address.phone} className="p-2.5 px-3 outline-none border border-slate-200 focus:border-indigo-500 rounded-lg w-full text-sm transition" type="text" placeholder="Phone (+977-98XXXXXXXX)" required />
                </div>

                <button 
                    type="submit" 
                    disabled={mutation.isPending}
                    className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-semibold py-2.5 rounded-lg transition-all mt-2 cursor-pointer flex items-center justify-center gap-2"
                >
                    {mutation.isPending ? (
                        <>
                            <span className="size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Saving Address...
                        </>
                    ) : (
                        "Save Address"
                    )}
                </button>
            </form>
        </div>
    )
}

export default AddressModal