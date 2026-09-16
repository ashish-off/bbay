'use client'
import { categories } from "@/assets/assets"
import Image from "next/image"
import { useState, useRef, useEffect } from "react"
import { toast } from "react-hot-toast"
import { useRouter, useParams } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchListing, updateListing } from "@/lib/api"
import { X, Plus, ArrowLeft, Save } from "lucide-react"
import Loading from "@/components/Loading"
import Link from "next/link"

export default function EditListing() {
    const router = useRouter()
    const { id } = useParams()
    const { user } = useUser()
    const { openSignIn } = useClerk()
    const queryClient = useQueryClient()
    const fileInputRef = useRef(null)
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'

    // Fetch the existing listing
    const { data: listing, isLoading, error } = useQuery({
        queryKey: ['listing', id],
        queryFn: () => fetchListing(id),
        enabled: !!id,
    })

    const [initialized, setInitialized] = useState(false)
    const [listingType, setListingType] = useState('fixed')
    // existingImages: URLs already on the server
    // newImages: new files picked locally [{ id, file, previewUrl }]
    const [existingImages, setExistingImages] = useState([])
    const [newImages, setNewImages] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])

    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: "",
        price: "",
        startingBid: "",
        buyNowPrice: "",
        stock: "1",
    })

    // Pre-fill form once listing loads
    useEffect(() => {
        if (listing && !initialized) {
            setListingType(listing.listingType?.toLowerCase() || 'fixed')
            setExistingImages(listing.images || [])
            setSelectedCategories(
                listing.category ? listing.category.split(',').map(c => c.trim()).filter(Boolean) : []
            )
            setProductInfo({
                name: listing.name || "",
                description: listing.description || "",
                mrp: listing.mrp != null ? String(listing.mrp) : "",
                price: listing.price != null ? String(listing.price) : "",
                startingBid: listing.startingBid != null ? String(listing.startingBid) : "",
                buyNowPrice: listing.buyNowPrice != null ? String(listing.buyNowPrice) : "",
                stock: listing.stock != null ? String(listing.stock) : "1",
            })
            setInitialized(true)
        }
    }, [listing, initialized])

    const totalImageCount = existingImages.length + newImages.length
    const maxImages = 6

    const handleCategoryToggle = (cat) => {
        setSelectedCategories(prev =>
            prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
        )
    }

    const mutation = useMutation({
        mutationFn: updateListing,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['seller-listings'] })
            queryClient.invalidateQueries({ queryKey: ['listings'] })
            queryClient.invalidateQueries({ queryKey: ['listing', id] })
            toast.success('Listing updated successfully!')
            router.push('/sell/my-listings')
        },
        onError: (err) => {
            toast.error(err.message || 'Failed to update listing')
        },
    })

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    // Handle new file selection
    const handleFilesSelect = (e) => {
        const files = Array.from(e.target.files || [])
        if (!files.length) return

        const remainingSlots = maxImages - totalImageCount
        if (remainingSlots <= 0) {
            toast.error(`Maximum of ${maxImages} photos allowed`)
            return
        }

        const allowedFiles = files.slice(0, remainingSlots)
        if (files.length > remainingSlots) {
            toast(`Added first ${remainingSlots} photos (max ${maxImages})`, { icon: 'ℹ️' })
        }

        const newEntries = allowedFiles.map(file => ({
            id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            file,
            previewUrl: URL.createObjectURL(file),
        }))

        setNewImages(prev => [...prev, ...newEntries])
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    // Remove an existing image (URL)
    const handleRemoveExisting = (url) => {
        setExistingImages(prev => prev.filter(u => u !== url))
    }

    // Remove a newly added image
    const handleRemoveNew = (idToRemove) => {
        setNewImages(prev => {
            const item = prev.find(img => img.id === idToRemove)
            if (item?.previewUrl) URL.revokeObjectURL(item.previewUrl)
            return prev.filter(img => img.id !== idToRemove)
        })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()

        if (!user) {
            toast.error('Please sign in')
            openSignIn()
            return
        }

        if (totalImageCount === 0) {
            return toast.error('Please add at least 1 image')
        }

        if (selectedCategories.length === 0) {
            return toast.error('Please select at least 1 category')
        }

        const fd = new FormData()

        // Append existing images as URLs to keep
        existingImages.forEach(url => {
            fd.append('existingImages', url)
        })

        // Append new image files
        newImages.forEach(img => {
            fd.append('images', img.file)
        })

        fd.append('name', productInfo.name)
        fd.append('description', productInfo.description)
        fd.append('category', selectedCategories.join(', '))

        if (listingType === 'auction') {
            fd.append('startingBid', productInfo.startingBid)
            if (productInfo.buyNowPrice) fd.append('buyNowPrice', productInfo.buyNowPrice)
        } else {
            fd.append('price', productInfo.price)
            fd.append('mrp', productInfo.mrp || '')
            fd.append('stock', productInfo.stock || '1')
        }

        mutation.mutate({ id, formData: fd })
    }

    if (isLoading) {
        return (
            <div className="max-w-2xl h-64 flex items-center justify-center">
                <Loading />
            </div>
        )
    }

    if (error) {
        return (
            <div className="max-w-2xl py-16 text-center">
                <p className="text-red-500 text-sm">{error.message}</p>
                <Link href="/sell/my-listings" className="text-indigo-600 text-sm hover:underline mt-3 inline-block">
                    ← Back to My Listings
                </Link>
            </div>
        )
    }

    return (
        <form onSubmit={onSubmitHandler} className="text-slate-600 mb-28 max-w-2xl">
            <div className="flex items-center gap-3 mb-1">
                <Link href="/sell/my-listings" className="text-slate-400 hover:text-indigo-600 transition" title="Back">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl">Edit <span className="text-slate-800 font-semibold">Listing</span></h1>
            </div>
            <p className="text-xs text-slate-400 mt-1 ml-8">Update your listing details, images, and stock.</p>

            {/* Listing Type (read-only indicator) */}
            <div className="mt-6 mb-4">
                <p className="text-sm font-medium text-slate-700 mb-2">Listing Format</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className={`flex items-center gap-3 p-3.5 border rounded-xl transition ${listingType === 'auction' ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium shadow-xs' : 'border-slate-200 opacity-50'}`}>
                        <div className={`size-4 rounded-full border-2 ${listingType === 'auction' ? 'border-indigo-600 bg-indigo-600' : 'border-slate-300'}`}>
                            {listingType === 'auction' && <div className="size-full rounded-full bg-white scale-[0.35]" />}
                        </div>
                        <div>
                            <p className="text-sm font-semibold">🔨 Live Auction</p>
                            <p className="text-[11px] text-slate-500 font-normal">Buyers bid against each other</p>
                        </div>
                    </div>
                    <div className={`flex items-center gap-3 p-3.5 border rounded-xl transition ${listingType === 'fixed' ? 'border-emerald-600 bg-emerald-50/50 text-emerald-950 font-medium shadow-xs' : 'border-slate-200 opacity-50'}`}>
                        <div className={`size-4 rounded-full border-2 ${listingType === 'fixed' ? 'border-emerald-600 bg-emerald-600' : 'border-slate-300'}`}>
                            {listingType === 'fixed' && <div className="size-full rounded-full bg-white scale-[0.35]" />}
                        </div>
                        <div>
                            <p className="text-sm font-semibold">🛒 Buy It Now (Fixed Price)</p>
                            <p className="text-[11px] text-slate-500 font-normal">Buyer pays a fixed price instantly</p>
                        </div>
                    </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1.5">Listing type cannot be changed after creation.</p>
            </div>

            {/* Multi-Image Upload Area */}
            <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-slate-700">
                        Item Photos <span className="text-xs text-slate-400 font-normal">(Up to 6 photos. First is primary)</span>
                    </p>
                    <span className="text-xs text-indigo-600 font-medium">{totalImageCount}/6 selected</span>
                </div>

                <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFilesSelect}
                    className="hidden"
                    id="edit-multi-image-input"
                />

                <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mt-2">
                    {/* Existing images */}
                    {existingImages.map((url, idx) => (
                        <div key={`existing-${idx}`} className="relative group aspect-square rounded-xl border border-slate-200 bg-slate-50 overflow-hidden shadow-xs">
                            <Image
                                src={url}
                                alt={`Item image ${idx + 1}`}
                                fill
                                unoptimized
                                className="object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            {idx === 0 && newImages.length === 0 && (
                                <span className="absolute bottom-1 left-1 bg-indigo-600/90 text-[10px] text-white font-medium px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
                                    Primary
                                </span>
                            )}
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemoveExisting(url) }}
                                title="Remove photo"
                                className="absolute top-1 right-1 size-6 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition shadow-md"
                            >
                                <X className="size-3.5 stroke-[2.5]" />
                            </button>
                        </div>
                    ))}

                    {/* New images */}
                    {newImages.map((item, idx) => (
                        <div key={item.id} className="relative group aspect-square rounded-xl border-2 border-dashed border-emerald-300 bg-emerald-50/30 overflow-hidden shadow-xs">
                            <Image
                                src={item.previewUrl}
                                alt={`New image ${idx + 1}`}
                                fill
                                unoptimized
                                className="object-cover transition-transform duration-200 group-hover:scale-105"
                            />
                            <span className="absolute bottom-1 left-1 bg-emerald-600/90 text-[10px] text-white font-medium px-1.5 py-0.5 rounded shadow-xs pointer-events-none">
                                New
                            </span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRemoveNew(item.id) }}
                                title="Remove photo"
                                className="absolute top-1 right-1 size-6 rounded-full bg-slate-900/80 hover:bg-red-600 text-white flex items-center justify-center transition shadow-md"
                            >
                                <X className="size-3.5 stroke-[2.5]" />
                            </button>
                        </div>
                    ))}

                    {/* Add more button */}
                    {totalImageCount < maxImages && (
                        <label
                            htmlFor="edit-multi-image-input"
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
                <input type="text" name="name" onChange={onChangeHandler} value={productInfo.name} placeholder="Item title" className="w-full p-2.5 px-3 outline-none border border-slate-200 rounded-lg text-sm font-normal" required />
            </label>

            <label className="flex flex-col gap-1.5 my-5 text-sm font-medium text-slate-700">
                Description & Condition
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Describe the item" rows={4} className="w-full p-2.5 px-3 outline-none border border-slate-200 rounded-lg resize-none text-sm font-normal" required />
            </label>

            <div className="my-5">
                <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium text-slate-700">
                        Categories <span className="text-xs text-slate-400 font-normal">(Select all that apply)</span>
                    </label>
                    {selectedCategories.length > 0 && (
                        <span className="text-xs text-indigo-600 font-semibold">
                            {selectedCategories.length} selected
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mt-2">
                    {categories.map((cat) => {
                        const isSelected = selectedCategories.includes(cat);
                        return (
                            <button
                                key={cat}
                                type="button"
                                onClick={() => handleCategoryToggle(cat)}
                                className={`px-3.5 py-2 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 cursor-pointer ${
                                    isSelected
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs ring-2 ring-indigo-200 font-semibold'
                                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                                }`}
                            >
                                {isSelected ? <span>✓ {cat}</span> : <span>+ {cat}</span>}
                            </button>
                        );
                    })}
                </div>

                {selectedCategories.length === 0 && (
                    <p className="text-[11px] text-amber-600 mt-1.5">Please select at least one category</p>
                )}
            </div>

            {/* Pricing fields based on type */}
            {listingType === 'auction' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
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
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-5">
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
                    <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                        Stock Quantity
                        <input
                            type="number"
                            name="stock"
                            onChange={onChangeHandler}
                            value={productInfo.stock}
                            placeholder="e.g. 10"
                            min="0"
                            className="p-2.5 px-3 outline-none border border-slate-200 rounded-lg text-sm font-normal"
                            required
                        />
                        {listing && listing.stock === 0 && (
                            <span className="text-[11px] text-emerald-600 font-medium">Set stock &gt; 0 to re-list this item</span>
                        )}
                    </label>
                </div>
            )}

            <div className="flex items-center gap-3 mt-6">
                <button
                    type="submit"
                    disabled={mutation.isPending}
                    className="bg-indigo-600 disabled:bg-indigo-400 text-white px-8 py-2.5 hover:bg-indigo-700 rounded-lg transition font-medium text-sm flex items-center gap-2 cursor-pointer shadow-xs"
                >
                    {mutation.isPending ? (
                        <>
                            <span className="inline-block size-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                            Saving Changes...
                        </>
                    ) : (
                        <>
                            <Save size={16} />
                            Save Changes
                        </>
                    )}
                </button>
                <Link
                    href="/sell/my-listings"
                    className="px-6 py-2.5 border border-slate-200 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium transition"
                >
                    Cancel
                </Link>
            </div>
        </form>
    )
}
