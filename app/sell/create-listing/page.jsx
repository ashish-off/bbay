'use client'
import { assets, categories } from "@/assets/assets"
import Image from "next/image"
import { useState } from "react"
import { toast } from "react-hot-toast"
import { useRouter } from "next/navigation"
import { useDispatch } from "react-redux"
import { addProduct } from "@/lib/features/product/productSlice"

export default function CreateListing() {

    const router = useRouter()
    const dispatch = useDispatch()
    const currency = process.env.NEXT_PUBLIC_CURRENCY_SYMBOL || 'रु'

    const [listingType, setListingType] = useState('auction') // 'auction' | 'fixed'
    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: "",
        price: "",
        startingBid: "",
        buyNowPrice: "",
        duration: "3", // days
        category: "",
    })
    const [loading, setLoading] = useState(false)

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)

        const isAuction = listingType === 'auction'
        const durationDays = Number(productInfo.duration) || 3
        const auctionEndTime = isAuction 
            ? new Date(Date.now() + durationDays * 24 * 60 * 60 * 1000).toISOString()
            : null

        const startBid = Number(productInfo.startingBid) || 0
        const buyNow = productInfo.buyNowPrice ? Number(productInfo.buyNowPrice) : null

        const newListing = {
            id: `prod_${Date.now()}`,
            name: productInfo.name,
            description: productInfo.description,
            mrp: productInfo.mrp ? Number(productInfo.mrp) : (isAuction ? buyNow || startBid * 1.5 : Number(productInfo.price)),
            price: isAuction ? (buyNow || startBid) : Number(productInfo.price),
            listingType,
            currentBid: isAuction ? startBid : null,
            startingBid: isAuction ? startBid : null,
            bidCount: 0,
            buyNowPrice: isAuction ? buyNow : null,
            auctionEndTime,
            images: [images[1] ? URL.createObjectURL(images[1]) : assets.product_img1],
            category: productInfo.category,
            inStock: true,
            seller: { id: "user_1", name: "Ram Bahadur", image: assets.gs_logo },
            rating: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        }

        // Store into Redux
        dispatch(addProduct(newListing))

        setTimeout(() => {
            setLoading(false)
            toast.success(`${isAuction ? 'Auction' : 'Buy It Now'} listing published successfully!`)
            router.push('/sell/my-listings')
        }, 500)
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
                            <p className="text-sm font-semibold">🔨 Auction</p>
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
            
            <p className="mt-6 text-sm font-medium text-slate-700">Item Photos</p>
            <div className="flex gap-3 mt-3">
                {Object.keys(images).map((key) => (
                    <label key={key} htmlFor={`images${key}`}>
                        <Image width={300} height={300} className='h-16 w-16 object-cover border border-slate-200 rounded-lg cursor-pointer hover:border-slate-400 transition' src={images[key] ? URL.createObjectURL(images[key]) : assets.upload_area} alt="" />
                        <input type="file" accept='image/*' id={`images${key}`} onChange={e => setImages({ ...images, [key]: e.target.files[0] })} hidden />
                    </label>
                ))}
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
                            <option value="1">1 Day</option>
                            <option value="3">3 Days</option>
                            <option value="5">5 Days</option>
                            <option value="7">7 Days</option>
                            <option value="10">10 Days</option>
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

            <button disabled={loading} className="bg-indigo-600 text-white px-8 mt-4 py-2.5 hover:bg-indigo-700 rounded-lg transition font-medium text-sm">
                {loading ? "Publishing..." : (listingType === 'auction' ? "Start Auction" : "List Buy It Now Item")}
            </button>
        </form>
    )
}