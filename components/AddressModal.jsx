'use client'
import { XIcon } from "lucide-react"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useDispatch } from "react-redux"
import { addAddress } from "@/lib/features/address/addressSlice"

const AddressModal = ({ setShowAddressModal }) => {

    const dispatch = useDispatch()

    const [address, setAddress] = useState({
        name: '',
        email: '',
        street: '',
        city: 'Pokhara',
        state: 'Gandaki Province',
        zip: '',
        country: 'Nepal',
        phone: '+977-'
    })

    const handleAddressChange = (e) => {
        setAddress({
            ...address,
            [e.target.name]: e.target.value
        })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        dispatch(addAddress(address))
        toast.success("Address added!")
        setShowAddressModal(false)
    }

    return (
        <form onSubmit={e => toast.promise(handleSubmit(e), { loading: 'Adding Address...' })} className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs h-screen flex items-center justify-center">
            <div className="flex flex-col gap-4 text-slate-700 w-full max-w-sm mx-6 bg-white p-6 rounded-xl shadow-xl relative">
                <h2 className="text-2xl font-semibold">Delivery <span className="text-indigo-600">Address</span></h2>
                <input name="name" onChange={handleAddressChange} value={address.name} className="p-2 px-3 outline-none border border-slate-200 rounded w-full text-sm" type="text" placeholder="Full Name" required />
                <input name="email" onChange={handleAddressChange} value={address.email} className="p-2 px-3 outline-none border border-slate-200 rounded w-full text-sm" type="email" placeholder="Email address" required />
                <input name="street" onChange={handleAddressChange} value={address.street} className="p-2 px-3 outline-none border border-slate-200 rounded w-full text-sm" type="text" placeholder="Street / Tole / Area (e.g., Lakeside-6)" required />
                <div className="flex gap-3">
                    <input name="city" onChange={handleAddressChange} value={address.city} className="p-2 px-3 outline-none border border-slate-200 rounded w-full text-sm" type="text" placeholder="City (Pokhara, KTM)" required />
                    <input name="state" onChange={handleAddressChange} value={address.state} className="p-2 px-3 outline-none border border-slate-200 rounded w-full text-sm" type="text" placeholder="Province" required />
                </div>
                <div className="flex gap-3">
                    <input name="zip" onChange={handleAddressChange} value={address.zip} className="p-2 px-3 outline-none border border-slate-200 rounded w-full text-sm" type="text" placeholder="Zip code" required />
                    <input name="country" onChange={handleAddressChange} value={address.country} className="p-2 px-3 outline-none border border-slate-200 rounded w-full text-sm" type="text" placeholder="Country" required />
                </div>
                <input name="phone" onChange={handleAddressChange} value={address.phone} className="p-2 px-3 outline-none border border-slate-200 rounded w-full text-sm" type="text" placeholder="Phone (+977-98XXXXXXXX)" required />
                <button className="bg-indigo-600 text-white text-sm font-medium py-2.5 rounded-md hover:bg-indigo-700 active:scale-95 transition-all mt-2">SAVE ADDRESS</button>
                <XIcon size={24} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 cursor-pointer" onClick={() => setShowAddressModal(false)} />
            </div>
        </form>
    )
}

export default AddressModal