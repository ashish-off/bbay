import { Outfit } from "next/font/google";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";
import {ClerkProvider} from '@clerk/nextjs'

const outfit = Outfit({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata = {
    title: "bbay - Bid, Buy & Sell",
    description: "bbay - Nepal's Premier Auction & Shopping Platform",
};

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                <StoreProvider>
                    <Toaster />
                    {children}
                </StoreProvider>
            </body>
        </html>
        </ClerkProvider>
    );
}
