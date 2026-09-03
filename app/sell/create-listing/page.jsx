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

    const [listingType, setListingType] = useState('fixed') // default is Buy Now
    const [images, setImages] = useState({ 1: null, 2: null, 3: null, 4: null })
    const [productInfo, setProductInfo] = useState({
        name: "",
        description: "",
        mrp: "",
        price: "",
        category: "",
    })
    const [loading, setLoading] = useState(false)

    const onChangeHandler = (e) => {
        setProductInfo({ ...productInfo, [e.target.name]: e.target.value })
    }

    const onSubmitHandler = async (e) => {
        e.preventDefault()
        setLoading(true)

        const newListing = {
            id: `prod_${Date.now()}`,
            name: productInfo.name,
            description: productInfo.description,
            mrp: Number(productInfo.mrp) || Number(productInfo.price),
            price: Number(productInfo.price),
            listingType: 'fixed',
            currentBid: null,
            startingBid: null,
            bidCount: 0,
            buyNowPrice: null,
            auctionEndTime: null,
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
            toast.success("Buy It Now listing published successfully!")
            router.push('/sell/my-listings')
        }, 500)
    }

    return (
        <form onSubmit={onSubmitHandler} className="text-slate-600 mb-28 max-w-2xl">
            <h1 className="text-2xl">Create <span className="text-slate-800 font-semibold">Buy It Now</span> Listing</h1>
            <p className="text-xs text-slate-400 mt-1">Users can buy your item instantly at the fixed price.</p>
            
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
                <textarea name="description" onChange={onChangeHandler} value={productInfo.description} placeholder="Describe the item, specifications, inclusions, etc." rows={4} className="w-full p-2.5 px-3 outline-none border border-slate-200 rounded-lg resize-none text-sm font-normal" required />
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

            {/* Price Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                    Selling Price ({currency})
                    <input type="number" name="price" onChange={onChangeHandler} value={productInfo.price} placeholder="e.g. 4500" className="p-2.5 px-3 outline-none border border-slate-200 rounded-lg text-sm font-normal" required />
                </label>
                <label className="flex flex-col gap-1.5 text-sm font-medium text-slate-700">
                    Original MRP ({currency})
                    <input type="number" name="mrp" onChange={onChangeHandler} value={productInfo.mrp} placeholder="e.g. 6000" className="p-2.5 px-3 outline-none border border-slate-200 rounded-lg text-sm font-normal" />
                </label>
            </div>

            <button disabled={loading} className="bg-indigo-600 text-white px-8 mt-4 py-2.5 hover:bg-indigo-700 rounded-lg transition font-medium text-sm">
                {loading ? "Publishing..." : "List Buy It Now Item"}
            </button>
        </form>
    )
}