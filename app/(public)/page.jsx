'use client'
import Hero from "@/components/Hero";
import OurSpecs from "@/components/OurSpec";
import LiveAuctions from "@/components/LiveAuctions";
import EndingSoon from "@/components/EndingSoon";
import BuyNowCatalogue from "@/components/BuyNowCatalogue";

export default function Home() {
    return (
        <div>
            <Hero />
            <LiveAuctions />
            <EndingSoon />
            <BuyNowCatalogue />
            <OurSpecs />
        </div>
    );
}
