'use client'
import { useUser, useClerk } from "@clerk/nextjs"
import { useEffect } from "react"
import Loading from "@/components/Loading"
import SellerNavbar from "./StoreNavbar"
import SellerSidebar from "./StoreSidebar"

const SellerLayout = ({ children }) => {
    const { user, isLoaded } = useUser()
    const { redirectToSignIn } = useClerk()

    useEffect(() => {
        if (isLoaded && !user) {
            redirectToSignIn({ returnBackUrl: window.location.href })
        }
    }, [isLoaded, user, redirectToSignIn])

    if (!isLoaded || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <Loading label="Redirecting to login..." />
            </div>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-slate-50">
            <SellerNavbar />
            <div className="flex flex-1 items-start h-full overflow-y-scroll no-scrollbar">
                <SellerSidebar />
                <div className="flex-1 h-full p-5 lg:pl-12 lg:pt-12 overflow-y-scroll">
                    {children}
                </div>
            </div>
        </div>
    )
}

export default SellerLayout