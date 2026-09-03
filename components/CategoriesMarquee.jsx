'use client'
import { categories } from "@/assets/assets";
import { useRouter } from "next/navigation";

const CategoriesMarquee = () => {
    const router = useRouter();

    return (
        <div className="overflow-hidden w-full relative max-w-7xl mx-auto select-none group sm:my-20">
            <div className="absolute left-0 top-0 h-full w-20 z-10 pointer-events-none bg-gradient-to-r from-white to-transparent" />
            <div className="flex w-max animate-[marqueeScroll_15s_linear_infinite] sm:animate-[marqueeScroll_35s_linear_infinite] group-hover:[animation-play-state:paused] gap-4" >
                {[...categories, ...categories, ...categories, ...categories].map((category, index) => (
                    <button 
                        key={index} 
                        onClick={() => router.push(`/shop?search=${encodeURIComponent(category)}`)}
                        className="flex-shrink-0 whitespace-nowrap px-6 py-2.5 bg-slate-100 rounded-xl text-slate-600 text-xs sm:text-sm font-medium hover:bg-indigo-600 hover:text-white active:scale-95 transition-all duration-300 shadow-xs"
                    >
                        {category}
                    </button>
                ))}
            </div>
            <div className="absolute right-0 top-0 h-full w-20 md:w-40 z-10 pointer-events-none bg-gradient-to-l from-white to-transparent" />
        </div>
    );
};

export default CategoriesMarquee;