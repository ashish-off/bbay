'use client'
import { categories } from "@/assets/assets"
import Image from "next/image"
import { useState, useRef } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { createListing } from "@/lib/api"
import { X, Upload, Plus, Image as ImageIcon } from "lucide-react"

export default function CreateListing() {
    const router = useRouter()
    const { user } = useUser()
    const { openSignIn } = useClerk()
    const queryClient = useQueryClient()
    const fileInputRef = useRef(null)
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'

    const [listingType, setListingType] = useState('auction') // 'auction' | 'fixed'
    // Array of files: [{ id: string, file: File, previewUrl: string }]
    const [selectedImages, setSelectedImages] = useState([])

    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: "",
        price: "",
        startingBid: "",
        buyNowPrice: "",
        duration: "3d", // default 3 days
        category: "",
    })

    const mutation = useMutation({
        mutationFn: createListing,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-listings'] })
            queryClient.invalidateQueries({ queryKey: ['listings'] })
            toast.success(`${listingType === 'auction' ? 'Auction' : 'Buy It Now'} listing published successfully!`)
            router.push('/sell/my-listings')
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to publish listing')
        },
    })

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    // Handle multi-image file pick (allows selecting multiple images at once)
    const handleFilesSelect = (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        const maxTotal = 6
        const remainingSlots = maxTotal - selectedImages.length

        if (remainingSlots <= 0) {
            toast.error(`Maximum of ${maxTotal} photos allowed`)
            return
        }

        const allowedFiles = files.slice(0, remainingSlots)
        if (files.length > remainingSlots) {
            toast(`Added first ${remainingSlots} photos (max ${maxTotal})`, { icon: 'ℹ️' })
        }

        const newEntries = allowedFiles.map(file => ({
            id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }))

        setSelectedImages(prev => [...prev, ...newEntries])
        // Reset input value so user can re-select if needed
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    // Undo / remove specific image
    const handleRemoveImage = (idToRemove) => {
        setSelectedImages(prev => {
            const item = prev.find(img => img.id === idToRemove)
            if (item?.previewUrl) {
                URL.revokeObjectURL(item.previewUrl)
            }
            return prev.filter(img => img.id !== idToRemove)
        })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (!user) {
            toast.error('Please sign in to create a listing')
            openSignIn()
            return
        }

        if (selectedImages.length === 0) {
            return toast.error('Please add at least 1 image')
        }

        const fd = new FormData()
        selectedImages.forEach(img => {
            fd.append('images', img.file)
        })

        fd.append('name', productInfo.name)
        fd.append('description', productInfo.description)
        fd.append('category', productInfo.category)
        fd.append('listingType', listingType.toUpperCase())

        if (listingType === 'auction') {
            fd.append('startingBid', productInfo.startingBid)
            if (productInfo.buyNowPrice) fd.append('buyNowPrice', productInfo.buyNowPrice)
            fd.append('duration', productInfo.duration)
        } else {
            fd.append('price', productInfo.price)
            if (productInfo.mrp) fd.append('mrp', productInfo.mrp)
        }

        mutation.mutate(fd)
    }

    return (
        <form onSubmit={onSubmitHandler} className="text-slate-600 mb-28 max-w-2xl">
            <h1 className="text-2xl">Create New <span className="text-slate-800 font-semibold">Listing</span></h1>
            <p className="text-xs text-slate-400 mt-1">Select whether to sell via live auction or instant fixed price.</p>

            {/* Listing Type Toggle */}
            <div className="mt-6 mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Listing Format</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <label className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition ${listingType === 'auction' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium shadow-xs' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input 
                            type="radio" 
                            name="listingType" 
                            value="auction" 
                            checked={listingType === 'auction'} 
                            onChange={() => setListingType('auction')} 
                            className="accent-indigo-600" 
                        />
                        <div>
                            <p className="text-sm font-semibold">🔨 Live Auction</p>
                            <p className="text-[11px] text-slate-500 font-normal">Buyers bid against each other</p>
                        </div>
                    </label>
                    <label className={`flex items-center gap-3 p-3.5 border rounded-xl cursor-pointer transition ${listingType === 'fixed' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-medium shadow-xs' : 'border-slate-200 hover:border-slate-300'}`}>
                        <input 
                            type="radio" 
                            name="listingType" 
                            value="fixed" 
                            checked={listingType === 'fixed'} 
                            onChange={() => setListingType('fixed')} 
                            className="accent-emerald-600" 
                        />
                        <div>
                            <p className="text-sm font-semibold">🛒 Buy It Now (Fixed Price)</p>
                            <p className="text-[11px] text-slate-500 font-normal">Buyer pays a fixed price instantly</p>
                        </div>
                    </label>
                </div>
            </div>
            
            {/* Multi-Image Upload Area */}
            <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">
                        Item Photos <span className="text-xs text-slate-400 font-normal">(Up to 6 photos, any size/ratio. First is primary)</span>
                    </p>
                    <span className="text-xs text-indigo-600 font-medium">{selectedImages.length}/6 selected</span>
                </div>

                {/* Hidden input supporting multi-selection */}
                <input 
                    ref={fileInputRef}
                    type="file" 
                    accept="image/*" 
                    multiple 
                    onChange={handleFilesSelect} 
                    className="hidden" 
                    id="multi-image-input" 
                />

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-2">
                    {selectedImages.map((item, idx) => (
                        <div key={item.id} className="relative group aspect-square rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs">
                            <Image 
                                src={item.previewUrl} 
                                alt={`Item image ${idx + 1}`} 
                                fill 
                                unoptimized
                                className="object-cover transition-transform duration-200 group-hover:scale-105" 
                            />
                            {/* Primary badge for first photo */}
                            {idx === 0 && (
                                <span className="absolute bottom-1 left-1 bg-indigo-600/90 text-[10px] text-white font-medium px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
                                    Primary
                                </span>
                            )}
                            {/* Top-right cross undo button */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveImage(item.id)
                                }}
                                title="Remove photo"
                                className="absolute top-1 right-1 size-6 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition shadow-md"
                            >
                                <X className="size-3.5 stroke-[2.5]" />
                            </button>
                        </div>
                    ))}

                    {/* Add more button if less than 6 */}
                    {selectedImages.length < 6 && (
                        <label 
                            htmlFor="multi-image-input" 
                            className="aspect-square rounded-xl border-2 border-dashed border-slate-200 hover:border-indigo-500 bg-slate-50 hover:bg-indigo-50/40 cursor-pointer flex flex-col items-center justify-center gap-1 text-slate-400 hover:text-indigo-600 transition group"
                        >
                            <div className="size-8 rounded-full bg-white group-hover:bg-indigo-100 flex items-center justify-center shadow-xs transition">
                                <Plus className="size-4 text-slate-500 group-hover:text-indigo-600" />
                            </div>
                            <span className="text-[11px] font-medium">Add Photos</span>
                        </label>
                    )}
                </div>
            </div>

            <label className="flex flex-col gap-1.5 my-5 text-sm font-medium text-slate-700">
                Title
                <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Item title (e.g. Sony WH-1000XM4 Headphones)" className="w-full p-2.5 px-3 outline-none border border-slate-200 rounded-lg text-sm font-normal" required />
            </label>

            <label className="flex flex-col gap-1.5 my-5 text-sm font-medium text-slate-700">
                Description & Condition
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Describe the item, specifications, inclusions, flaws, etc." rows={4} className="w-full p-2.5 px-3 outline-none border border-slate-200 rounded-lg resize-none text-sm font-normal" required />
            </label>

            <label className="flex flex-col gap-1.5 my-5 text-sm font-medium text-slate-700">
                Category
                <select onChange={e => setProductInfo({ ...productInfo, category: e.target.value })} value={productInfo.category} className="w-full p-2.5 px-3 outline-none border border-slate-200 rounded-lg text-sm font-normal" required>
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                        <option key={category} value={category}>{category}</option>
                    ))}
                </select>
            </label>

            {/* Auction Format Pricing */}
            {listingType === 'auction' ? (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                        Starting Bid ({currency})
                        <input 
                            type="number" 
                            name="startingBid" 
                            onChange={onChangeHandler} 
                            value={productInfo.startingBid} 
                            placeholder="e.g. 1000" 
                            min="1"
                            className="p-2.5 px-3 outline-none border border-slate-200 rounded-lg text-sm font-normal" 
                            required 
                        />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                        Buy It Now Price ({currency})
                        <input 
                            type="number" 
                            name="buyNowPrice" 
                            onChange={onChangeHandler} 
                            value={productInfo.buyNowPrice} 
                            placeholder="Optional shortcut price" 
                            className="p-2.5 px-3 outline-none border border-slate-200 rounded-lg text-sm font-normal" 
                        />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                        Auction Duration
                        <select 
                            name="duration" 
                            value={productInfo.duration} 
                            onChange={onChangeHandler} 
                            className="p-2.5 px-3 outline-none border border-slate-200 rounded-lg text-sm font-normal"
                        >
                            <option value="1h">1 Hour (Flash Auction)</option>
                            <option value="6h">6 Hours</option>
                            <option value="12h">12 Hours</option>
                            <option value="1d">1 Day</option>
                            <option value="2d">2 Days</option>
                            <option value="3d">3 Days (Recommended)</option>
                            <option value="5d">5 Days</option>
                            <option value="7d">7 Days (1 Week)</option>
                            <option value="10d">10 Days</option>
                            <option value="14d">14 Days (2 Weeks)</option>
                        </select>
                    </label>
                </div>
            ) : (
                /* Fixed Price Fields */
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                        Selling Price ({currency})
                        <input 
                            type="number" 
                            name="price" 
                            onChange={onChangeHandler} 
                            value={productInfo.price} 
                            placeholder="e.g. 4500" 
                            min="1"
                            className="p-2.5 px-3 outline-none border border-slate-200 rounded-lg text-sm font-normal" 
                            required 
                        />
                    </label>
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                        Original MRP ({currency})
                        <input 
                            type="number" 
                            name="mrp" 
                            onChange={onChangeHandler} 
                            value={productInfo.mrp} 
                            placeholder="e.g. 6000" 
                            className="p-2.5 px-3 outline-none border border-slate-200 rounded-lg text-sm font-normal" 
                        />
                    </label>
                </div>
            )}

            <button 
                type="submit"
                disabled={mutation.isPending} 
                className="bg-indigo-600 disabled:bg-indigo-400 text-white px-8 mt-4 py-2.5 hover:bg-indigo-700 rounded-lg transition font-medium text-sm flex items-center gap-2 cursor-pointer shadow-xs"
            >
                {mutation.isPending ? (
                    <>
                        <span className="inline-block size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Uploading Listing...
                    </>
                ) : (
                    listingType === 'auction' ? "Start Auction" : "List Buy It Now Item"
                )}
            </button>
        </form>
    )
}