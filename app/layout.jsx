import localFont from "next/font/local";
import { Toaster } from "react-hot-toast";
import StoreProvider from "@/app/StoreProvider";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs';

import QueryProvider from "@/components/QueryProvider";

const outfit = localFont({
    src: "./fonts/outfit.woff2",
    display: "swap",
    fallback: ["system-ui", "sans-serif"],
});

export const metadata = {
    title: "bbay - Bid, Buy & Sell",
    description: "bbay - Nepal's Premier Auction & Shopping Platform",
};

export default function RootLayout({ children }) {
    return (
        <ClerkProvider>
        <html lang="en">
            <body className={`${outfit.className} antialiased`}>
                <QueryProvider>
                    <StoreProvider>
                        <Toaster />
                        {children}
                    </StoreProvider>
                </QueryProvider>
            </body>
        </html>
        </ClerkProvider>
    );
}
