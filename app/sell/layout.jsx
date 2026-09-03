import SellerLayout from "@/components/sell/StoreLayout";

export const metadata = {
    title: "bbay - Seller Dashboard",
    description: "Manage your listings, bids, and sales on bbay",
};

export default function RootSellerLayout({ children }) {
    return (
        <SellerLayout>
            {children}
        </SellerLayout>
    );
}
