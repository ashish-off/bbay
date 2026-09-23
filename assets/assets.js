import gs_logo from "./gs_logo.png"
import happy_store from "./happy_store.webp"
import upload_area from "./upload_area.svg"
import hero_model_img from "./hero_model_img.png"
import hero_product_img1 from "./hero_product_img1.png"
import hero_product_img2 from "./hero_product_img2.png"
import product_img1 from "./product_img1.png"
import product_img2 from "./product_img2.png"
import product_img3 from "./product_img3.png"
import product_img4 from "./product_img4.png"
import product_img5 from "./product_img5.png"
import product_img6 from "./product_img6.png"
import product_img7 from "./product_img7.png"
import product_img8 from "./product_img8.png"
import product_img9 from "./product_img9.png"
import product_img10 from "./product_img10.png"
import product_img11 from "./product_img11.png"
import product_img12 from "./product_img12.png"
import { ShieldCheckIcon, HeadsetIcon, GavelIcon } from "lucide-react";
import profile_pic1 from "./profile_pic1.jpg"
import profile_pic2 from "./profile_pic2.jpg"
import profile_pic3 from "./profile_pic3.jpg"
import product_img14 from './product_img14.png'
import herohike from './herohikingimage.png'

export const assets = {
    upload_area, hero_model_img,
    hero_product_img1, hero_product_img2, gs_logo,
    product_img1, product_img2, product_img3, product_img4, product_img5, product_img6,
    product_img7, product_img8, product_img9, product_img10, product_img11, product_img12, product_img14,herohike
}

export const categories = ["Electronics", "Fashion", "Collectibles", "Home & Garden", "Vehicles & Parts", "Sports & Outdoors", "Books & Media", "Art & Crafts"];

export const dummyRatingsData = [
    { id: "rat_1", rating: 4.2, review: "I was a bit skeptical at first, but this product turned out to be even better than I imagined. The quality feels premium, it's easy to use, and it delivers exactly what was promised. I've already recommended it to friends and will definitely purchase again in the future.", user: { name: 'Aarav Sharma', image: profile_pic1 }, productId: "prod_1", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)', product: { name: 'Bluetooth Speakers', category: 'Electronics', id: 'prod_1' } },
    { id: "rat_2", rating: 5.0, review: "This product is great. I love it! Super fast delivery to Pokhara and the quality is amazing for the price.", user: { name: 'Sita Gurung', image: profile_pic2 }, productId: "prod_2", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)', product: { name: 'Bluetooth Speakers', category: 'Electronics', id: 'prod_1' } },
    { id: "rat_3", rating: 4.1, review: "This product is amazing. Exactly as described in the listing. Would bid on more items from this seller.", user: { name: 'Bikash Thapa', image: profile_pic3 }, productId: "prod_3", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)', product: { name: 'Bluetooth Speakers', category: 'Electronics', id: 'prod_1' } },
    { id: "rat_4", rating: 5.0, review: "Best purchase on bbay so far! The seller shipped quickly and the item was even better than the photos.", user: { name: 'Aarav Sharma', image: profile_pic1 }, productId: "prod_4", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)', product: { name: 'Bluetooth Speakers', category: 'Electronics', id: 'prod_1' } },
    { id: "rat_5", rating: 4.3, review: "Overall, I'm very happy with this purchase. It works as described and feels durable. Would recommend bbay to anyone looking for great deals.", user: { name: 'Sita Gurung', image: profile_pic2 }, productId: "prod_5", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)', product: { name: 'Bluetooth Speakers', category: 'Electronics', id: 'prod_1' } },
    { id: "rat_6", rating: 5.0, review: "Excellent quality and fast shipping within Nepal. Won this at auction for a great price!", user: { name: 'Bikash Thapa', image: profile_pic3 }, productId: "prod_6", createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)', updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)', product: { name: 'Bluetooth Speakers', category: 'Electronics', id: 'prod_1' } },
]

// Seller data (replaces store concept — any user can be a seller)
export const dummySellerData = {
    id: "user_1",
    name: "Ram Bahadur",
    email: "ram@bbay.com.np",
    image: gs_logo,
    location: "Lakeside, Pokhara",
    memberSince: "2025-01-15T00:00:00.000Z",
    totalListings: 12,
    totalSold: 45,
    averageRating: 4.7,
}

// Helper: generate future auction end times relative to now
const hoursFromNow = (h) => new Date(Date.now() + h * 60 * 60 * 1000).toISOString()

export const productDummyData = [
    {
        id: "prod_1",
        name: "Modern table lamp",
        description: "Modern table lamp with a sleek design. Perfect for any room. Made of high-quality materials with a lifetime warranty.",
        mrp: 5000,
        price: 3500,
        listingType: "auction",
        currentBid: 2800,
        startingBid: 1000,
        bidCount: 8,
        buyNowPrice: 5000,
        auctionEndTime: hoursFromNow(48),
        images: [product_img1, product_img2, product_img3, product_img4],
        category: "Home & Garden",
        inStock: true,
        seller: { id: "user_1", name: "Ram Bahadur", image: gs_logo },
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 29 2025 14:51:25 GMT+0545 (Nepal Time)',
        updatedAt: 'Sat Jul 29 2025 14:51:25 GMT+0545 (Nepal Time)',
    },
    {
        id: "prod_2",
        name: "Smart speaker gray",
        description: "Smart speaker with a sleek design. Perfect for any room. Made of high-quality materials with a lifetime warranty.",
        mrp: 7500,
        price: 4500,
        listingType: "fixed",
        currentBid: null,
        startingBid: null,
        bidCount: 0,
        buyNowPrice: null,
        auctionEndTime: null,
        images: [product_img2],
        inStock: true,
        seller: { id: "user_1", name: "Ram Bahadur", image: gs_logo },
        category: "Electronics",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 28 2025 14:51:25 GMT+0545 (Nepal Time)',
        updatedAt: 'Sat Jul 28 2025 14:51:25 GMT+0545 (Nepal Time)',
    },
    {
        id: "prod_3",
        name: "Smart watch white",
        description: "Smart watch with a premium design. Water resistant and packed with features for the modern lifestyle.",
        mrp: 12000,
        price: 8500,
        listingType: "auction",
        currentBid: 6200,
        startingBid: 3000,
        bidCount: 15,
        buyNowPrice: 12000,
        auctionEndTime: hoursFromNow(6),
        images: [product_img3],
        inStock: true,
        seller: { id: "user_2", name: "Sita Gurung", image: profile_pic2 },
        category: "Electronics",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 27 2025 14:51:25 GMT+0545 (Nepal Time)',
        updatedAt: 'Sat Jul 27 2025 14:51:25 GMT+0545 (Nepal Time)',
    },
    {
        id: "prod_4",
        name: "Wireless headphones",
        description: "Premium wireless headphones with noise cancellation. 40-hour battery life. Comfortable for long sessions.",
        mrp: 9000,
        price: 6500,
        listingType: "fixed",
        currentBid: null,
        startingBid: null,
        bidCount: 0,
        buyNowPrice: null,
        auctionEndTime: null,
        images: [product_img4],
        inStock: true,
        seller: { id: "user_1", name: "Ram Bahadur", image: gs_logo },
        category: "Electronics",
        rating: dummyRatingsData,
        createdAt: 'Sat Jul 26 2025 14:51:25 GMT+0545 (Nepal Time)',
        updatedAt: 'Sat Jul 26 2025 14:51:25 GMT+0545 (Nepal Time)',
    },
    {
        id: "prod_5",
        name: "Smart watch black",
        description: "Elegant smart watch in matte black. Heart rate monitoring, GPS tracking and 7-day battery life.",
        mrp: 15000,
        price: 11000,
        listingType: "auction",
        currentBid: 8500,
        startingBid: 5000,
        bidCount: 22,
        buyNowPrice: 15000,
        auctionEndTime: hoursFromNow(2),
        images: [product_img5],
        inStock: true,
        seller: { id: "user_3", name: "Bikash Thapa", image: profile_pic3 },
        category: "Electronics",
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 25 2025 14:51:25 GMT+0545 (Nepal Time)',
        updatedAt: 'Sat Jul 25 2025 14:51:25 GMT+0545 (Nepal Time)',
    },
    {
        id: "prod_6",
        name: "Security Camera",
        description: "HD security camera with night vision. WiFi enabled, motion detection, and cloud storage support.",
        mrp: 8500,
        price: 5500,
        listingType: "auction",
        currentBid: 4200,
        startingBid: 2000,
        bidCount: 11,
        buyNowPrice: 8500,
        auctionEndTime: hoursFromNow(72),
        images: [product_img6],
        inStock: true,
        seller: { id: "user_2", name: "Sita Gurung", image: profile_pic2 },
        category: "Electronics",
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 25 2025 14:51:25 GMT+0545 (Nepal Time)',
        updatedAt: 'Sat Jul 25 2025 14:51:25 GMT+0545 (Nepal Time)',
    },
    {
        id: "prod_7",
        name: "Smart Pen for iPad",
        description: "Precision stylus pen for iPad. Pressure sensitive with palm rejection technology.",
        mrp: 4500,
        price: 3200,
        listingType: "fixed",
        currentBid: null,
        startingBid: null,
        bidCount: 0,
        buyNowPrice: null,
        auctionEndTime: null,
        images: [product_img7],
        inStock: true,
        seller: { id: "user_1", name: "Ram Bahadur", image: gs_logo },
        category: "Electronics",
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 24 2025 14:51:25 GMT+0545 (Nepal Time)',
        updatedAt: 'Sat Jul 24 2025 14:51:25 GMT+0545 (Nepal Time)',
    },
    {
        id: "prod_8",
        name: "Home Theater",
        description: "5.1 surround sound home theater system. Deep bass, crystal clear audio. Perfect for movie nights.",
        mrp: 25000,
        price: 18000,
        listingType: "auction",
        currentBid: 14500,
        startingBid: 8000,
        bidCount: 19,
        buyNowPrice: 25000,
        auctionEndTime: hoursFromNow(120),
        images: [product_img8],
        inStock: true,
        seller: { id: "user_3", name: "Bikash Thapa", image: profile_pic3 },
        category: "Electronics",
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 23 2025 14:51:25 GMT+0545 (Nepal Time)',
        updatedAt: 'Sat Jul 23 2025 14:51:25 GMT+0545 (Nepal Time)',
    },
    {
        id: "prod_9",
        name: "Apple Wireless Earbuds",
        description: "Premium wireless earbuds with active noise cancellation. Spatial audio and sweat-resistant design.",
        mrp: 18000,
        price: 13500,
        listingType: "fixed",
        currentBid: null,
        startingBid: null,
        bidCount: 0,
        buyNowPrice: null,
        auctionEndTime: null,
        images: [product_img9],
        inStock: true,
        seller: { id: "user_2", name: "Sita Gurung", image: profile_pic2 },
        category: "Electronics",
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 22 2025 14:51:25 GMT+0545 (Nepal Time)',
        updatedAt: 'Sat Jul 22 2025 14:51:25 GMT+0545 (Nepal Time)',
    },
    {
        id: "prod_10",
        name: "Apple Smart Watch",
        description: "Latest Apple Watch with always-on display. Health monitoring, cellular connectivity and premium build.",
        mrp: 55000,
        price: 42000,
        listingType: "auction",
        currentBid: 35000,
        startingBid: 20000,
        bidCount: 31,
        buyNowPrice: 55000,
        auctionEndTime: hoursFromNow(18),
        images: [product_img10],
        inStock: true,
        seller: { id: "user_1", name: "Ram Bahadur", image: gs_logo },
        category: "Electronics",
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 21 2025 14:51:25 GMT+0545 (Nepal Time)',
        updatedAt: 'Sat Jul 21 2025 14:51:25 GMT+0545 (Nepal Time)',
    },
    {
        id: "prod_11",
        name: "RGB Gaming Mouse",
        description: "High-precision gaming mouse with customizable RGB lighting. 16000 DPI sensor with programmable buttons.",
        mrp: 3500,
        price: 2500,
        listingType: "auction",
        currentBid: 1800,
        startingBid: 800,
        bidCount: 7,
        buyNowPrice: 3500,
        auctionEndTime: hoursFromNow(1),
        images: [product_img11],
        inStock: true,
        seller: { id: "user_3", name: "Bikash Thapa", image: profile_pic3 },
        category: "Electronics",
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 20 2025 14:51:25 GMT+0545 (Nepal Time)',
        updatedAt: 'Sat Jul 20 2025 14:51:25 GMT+0545 (Nepal Time)',
    },
    {
        id: "prod_12",
        name: "Smart Home Cleaner",
        description: "Robotic vacuum cleaner with smart mapping. Auto-charging, app controlled, and great for pet owners.",
        mrp: 35000,
        price: 28000,
        listingType: "fixed",
        currentBid: null,
        startingBid: null,
        bidCount: 0,
        buyNowPrice: null,
        auctionEndTime: null,
        images: [product_img12],
        inStock: true,
        seller: { id: "user_2", name: "Sita Gurung", image: profile_pic2 },
        category: "Home & Garden",
        rating: [...dummyRatingsData, ...dummyRatingsData],
        createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)',
        updatedAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)',
    }
];

export const ourSpecsData = [
    { title: "Secure Bidding", description: "Bid with confidence. Every transaction is protected with buyer & seller guarantees.", icon: GavelIcon, accent: '#05DF72' },
    { title: "Buyer Protection", description: "Full refund if your item doesn't match the listing description. Shop worry-free.", icon: ShieldCheckIcon, accent: '#FF8904' },
    { title: "24/7 Support", description: "We're here for you around the clock. Get expert help anytime you need it.", icon: HeadsetIcon, accent: '#A684FF' }
]

export const addressDummyData = {
    id: "addr_1",
    userId: "user_1",
    name: "Ram Sharma",
    email: "ram.sharma@gmail.com",
    street: "Lakeside Marg",
    city: "Pokhara",
    state: "Gandaki Province",
    zip: "33700",
    country: "Nepal",
    phone: "+977-9841234567",
    createdAt: 'Sat Jul 19 2025 14:51:25 GMT+0545 (Nepal Time)',
}

export const couponDummyData = [
    { code: "NEW20", description: "20% Off for New Users", discount: 20, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:31.183Z" },
    { code: "NEW10", description: "10% Off for New Users", discount: 10, forNewUser: true, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:35:50.653Z" },
    { code: "OFF20", description: "20% Off for All Users", discount: 20, forNewUser: false, forMember: false, isPublic: false, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:00.811Z" },
    { code: "BBAY10", description: "10% Off Sitewide", discount: 10, forNewUser: false, forMember: false, isPublic: true, expiresAt: "2026-12-31T00:00:00.000Z", createdAt: "2025-08-22T08:42:21.279Z" },
    { code: "DASHAIN25", description: "25% Off for Dashain Festival", discount: 25, forNewUser: false, forMember: false, isPublic: true, expiresAt: "2026-10-31T00:00:00.000Z", createdAt: "2025-08-22T11:38:20.194Z" }
]

export const dummyUserData = {
    id: "user_1",
    name: "Ram Bahadur",
    email: "ram@bbay.com.np",
    image: gs_logo,
    cart: {}
}

export const dummyBidHistory = [
    { id: "bid_1", userId: "user_2", userName: "S***a G.", amount: 2800, productId: "prod_1", createdAt: hoursFromNow(-1) },
    { id: "bid_2", userId: "user_3", userName: "B***h T.", amount: 2500, productId: "prod_1", createdAt: hoursFromNow(-3) },
    { id: "bid_3", userId: "user_2", userName: "S***a G.", amount: 2200, productId: "prod_1", createdAt: hoursFromNow(-5) },
    { id: "bid_4", userId: "user_4", userName: "A***v S.", amount: 1800, productId: "prod_1", createdAt: hoursFromNow(-8) },
    { id: "bid_5", userId: "user_3", userName: "B***h T.", amount: 1500, productId: "prod_1", createdAt: hoursFromNow(-12) },
    { id: "bid_6", userId: "user_5", userName: "P***a M.", amount: 1200, productId: "prod_1", createdAt: hoursFromNow(-18) },
    { id: "bid_7", userId: "user_4", userName: "A***v S.", amount: 1000, productId: "prod_1", createdAt: hoursFromNow(-24) },
]

export const orderDummyData = [
    {
        id: "cmemm75h5001jtat89016h1p3",
        total: 13500,
        status: "DELIVERED",
        userId: "user_1",
        addressId: "addr_1",
        isPaid: false,
        paymentMethod: "COD",
        createdAt: "2025-08-22T09:15:03.929Z",
        updatedAt: "2025-08-22T09:15:50.723Z",
        isCouponUsed: true,
        coupon: couponDummyData[0],
        orderItems: [
            { orderId: "cmemm75h5001jtat89016h1p3", productId: "prod_2", quantity: 1, price: 4500, product: productDummyData[1], },
            { orderId: "cmemm75h5001jtat89016h1p3", productId: "prod_4", quantity: 1, price: 6500, product: productDummyData[3], }
        ],
        address: addressDummyData,
        user: dummyUserData
    },
    {
        id: "cmemm6jv7001htat8vmm3gxaf",
        total: 44700,
        status: "DELIVERED",
        userId: "user_1",
        addressId: "addr_1",
        isPaid: false,
        paymentMethod: "COD",
        createdAt: "2025-08-22T09:14:35.923Z",
        updatedAt: "2025-08-22T09:15:52.535Z",
        isCouponUsed: true,
        coupon: couponDummyData[0],
        orderItems: [
            { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "prod_9", quantity: 1, price: 13500, product: productDummyData[8], },
            { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "prod_7", quantity: 1, price: 3200, product: productDummyData[6], },
            { orderId: "cmemm6jv7001htat8vmm3gxaf", productId: "prod_12", quantity: 1, price: 28000, product: productDummyData[11], }
        ],
        address: addressDummyData,
        user: dummyUserData
    }
]

export const dummyUsersData = [
    {
        id: "user_1",
        name: "Ram Bahadur",
        email: "ram@bbay.com.np",
        image: gs_logo,
        isActive: true,
        totalListings: 12,
        totalSold: 45,
        joinedAt: "2025-01-15T00:00:00.000Z",
    },
    {
        id: "user_2",
        name: "Sita Gurung",
        email: "sita.gurung@gmail.com",
        image: profile_pic2,
        isActive: true,
        totalListings: 8,
        totalSold: 23,
        joinedAt: "2025-03-10T00:00:00.000Z",
    },
    {
        id: "user_3",
        name: "Bikash Thapa",
        email: "bikash.thapa@gmail.com",
        image: profile_pic3,
        isActive: true,
        totalListings: 15,
        totalSold: 67,
        joinedAt: "2025-02-20T00:00:00.000Z",
    },
]

export const dummyAdminDashboardData = {
    "totalListings": 12,
    "activeAuctions": 7,
    "totalTransactions": 6,
    "revenue": "58200",
    "allOrders": [
        { "createdAt": "2025-08-20T08:46:58.239Z", "total": 8500 },
        { "createdAt": "2025-08-22T08:46:21.818Z", "total": 6200 },
        { "createdAt": "2025-08-22T08:45:59.587Z", "total": 3500 },
        { "createdAt": "2025-08-23T09:15:03.929Z", "total": 13500 },
        { "createdAt": "2025-08-23T09:14:35.923Z", "total": 44700 },
        { "createdAt": "2025-08-23T11:44:29.713Z", "total": 2800 },
        { "createdAt": "2025-08-24T09:15:03.929Z", "total": 11000 },
        { "createdAt": "2025-08-24T09:14:35.923Z", "total": 35000 },
        { "createdAt": "2025-08-24T11:44:29.713Z", "total": 4500 },
        { "createdAt": "2025-08-24T11:56:29.713Z", "total": 7500 },
        { "createdAt": "2025-08-25T11:44:29.713Z", "total": 3200 },
        { "createdAt": "2025-08-25T09:15:03.929Z", "total": 18000 },
        { "createdAt": "2025-08-25T09:14:35.923Z", "total": 42000 },
        { "createdAt": "2025-08-25T11:44:29.713Z", "total": 5500 },
        { "createdAt": "2025-08-25T11:56:29.713Z", "total": 8500 },
        { "createdAt": "2025-08-25T11:30:29.713Z", "total": 25000 }
    ]
}

export const dummySellerDashboardData = {
    "ratings": dummyRatingsData,
    "totalOrders": 2,
    "totalEarnings": 58200,
    "activeListings": 5,
    "activeAuctions": 3,
}